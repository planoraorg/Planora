import express from "express";
import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(__dirname));

// ===========================
// ROOT ROUTE
// ===========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "public", "home.html"));
});

// ===========================
// FIREBASE SETUP
// ===========================
// NOTE: User must place serviceAccountKey.json in the root directory
// or set FIREBASE_SERVICE_ACCOUNT_KEY env variable (for Vercel)
try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    serviceAccount = JSON.parse(
      fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf8")
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  console.log("✅ Firebase Admin Initialized Successfully");
} catch (error) {
  console.warn("⚠️ Firebase Initialization Failed or Skipped:");
  console.warn("Make sure 'serviceAccountKey.json' is in the root directory.");
  console.error(error.message);
}

const db = admin.firestore();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===========================
// HELPER FUNCTIONS
// ===========================
const getCollection = (role) => (role === "professional" ? "professionals" : "users");

// ===========================
// AUTHENTICATION MIDDLEWARE
// ===========================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("❌ No token provided for", req.path);
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ Invalid token for", req.path, err.message);
      return res.status(403).json({ error: "Invalid token" });
    }
    console.log(`✅ User ${user.id} authenticated for ${req.path}`);
    req.user = user;
    next();
  });
};

// ===========================
// AUTH ROUTES
// ===========================

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: hashed,
      role: "user",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Only add phone and location if they are provided
    if (phone) newUser.phone = phone;
    if (location) newUser.location = location;

    const docRef = await usersRef.add(newUser);
    const token = jwt.sign(
      { id: docRef.id, email, name, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ User registered successfully",
      token,
      user: { id: docRef.id, name, email, role: "user" },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Profile Update
app.put("/api/users/:id/update", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.id !== userId) return res.status(403).json({ error: "Unauthorized" });

    const { name, phone, location } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (location) updates.location = location;

    await db.collection("users").doc(userId).update(updates);

    // Refresh token with new data
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    const token = jwt.sign(
      { id: userDoc.id, email: userData.email, name: userData.name, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Profile updated successfully", token, user: { id: userDoc.id, ...userData } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Professional Registration
app.post("/api/professional-register", upload.single("degree"), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      phone,
      city,
      state,
      bio,
      experience_years,
      hourly_rate,
    } = req.body;
    const degreePath = req.file ? req.file.path : null;

    const prosRef = db.collection("professionals");
    const snapshot = await prosRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: "Professional already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newPro = {
      name,
      email,
      password: hashed,
      specialization,
      experience_years: parseInt(experience_years) || 0,
      hourly_rate: parseFloat(hourly_rate) || 0,
      degree_document: degreePath,
      is_verified: false,
      role: "professional",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      rating: 0,
      total_reviews: 0,
      total_projects: 0,
    };

    // Add optional fields only if provided
    if (phone) newPro.phone = phone;
    if (city) newPro.city = city;
    if (state) newPro.state = state;
    if (bio) newPro.bio = bio;

    const docRef = await prosRef.add(newPro);

    res.json({
      message: "✅ Professional registered (Pending admin verification)",
      professionalId: docRef.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const collectionName = role === "professional" ? "professionals" : "users";

    const snapshot = await db.collection(collectionName).where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Account not found" });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: userDoc.id,
        email: user.email,
        name: user.name,
        role: role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: `✅ ${role === "professional" ? "Professional" : "User"} Login Successful`,
      token,
      user: {
        id: userDoc.id,
        name: user.name,
        email: user.email,
        role: role || "user",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single professional profile with projects and reviews
app.get("/api/professionals/:id", async (req, res) => {
  try {
    const profDoc = await db.collection("professionals").doc(req.params.id).get();

    if (!profDoc.exists) {
      return res.status(404).json({ message: "Professional not found" });
    }

    const professional = { id: profDoc.id, ...profDoc.data() };

    // Get professional's projects
    const projectsSnapshot = await db
      .collection("projects")
      .where("professional_id", "==", req.params.id)
      .get();

    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get professional's reviews  
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("professional_id", "==", req.params.id)
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      professional,
      projects,
      reviews
    });
  } catch (error) {
    console.error("Error fetching professional:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// PROJECTS API
// ===========================

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const { category, location } = req.query;
    let query = db.collection("projects");

    if (category) query = query.where("category", "==", category);

    // Firestore lacks native substring search (LIKE %...%). 
    // We will filter by exact match for now or do client-side filtering.
    // For MVP, we'll ignore location partial match in query.

    const snapshot = await query.get();
    let projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Manual filter for location if needed
    if (location) {
      projects = projects.filter(p => p.location && p.location.toLowerCase().includes(location.toLowerCase()));
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
app.get("/api/projects/:id", async (req, res) => {
  try {
    const doc = await db.collection("projects").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Project not found" });

    const project = { id: doc.id, ...doc.data() };

    // Fetch professional details if available
    if (project.professional_id) {
      const proDoc = await db.collection("professionals").doc(project.professional_id).get();
      if (proDoc.exists) {
        const proData = proDoc.data();
        project.architect_name = proData.name;
        project.specialization = proData.specialization;
        project.rating = proData.rating;
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
app.post("/api/projects", authenticateToken, upload.array("images", 10), async (req, res) => {
  try {
    const { title, category, location, area, budget, description } = req.body;
    const userId = req.user.id;
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const imageUrls = req.files ? req.files.map(f => f.path) : [];

    const newProject = {
      title,
      slug,
      category,
      location,
      area,
      budget,
      description,
      user_id: userId,
      images: imageUrls, // Storing array of strings directly in project doc
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("projects").add(newProject);
    res.json({ message: "Project created", projectId: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// PROFESSIONALS API
// ===========================

app.get("/api/professionals", async (req, res) => {
  try {
    const { specialization, city, minRating, maxRate } = req.query;
    let query = db.collection("professionals"); //.where("is_verified", "==", true);
    // Note: removed is_verified check temporarily or ensure your data has it true

    if (specialization) query = query.where("specialization", "==", specialization);
    if (city) query = query.where("city", "==", city);
    if (minRating) query = query.where("rating", ">=", parseFloat(minRating));
    if (maxRate) query = query.where("hourly_rate", "<=", parseFloat(maxRate));

    const snapshot = await query.get();
    const professionals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(professionals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/professionals/:id", async (req, res) => {
  try {
    const proDoc = await db.collection("professionals").doc(req.params.id).get();
    if (!proDoc.exists) return res.status(404).json({ message: "Professional not found" });

    const professional = { id: proDoc.id, ...proDoc.data() };

    // Fetch Projects
    const projectsSnap = await db.collection("projects")
      .where("professional_id", "==", req.params.id)
      .limit(6)
      .get();
    const projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch Reviews
    const reviewsSnap = await db.collection("reviews")
      .where("professional_id", "==", req.params.id)
      .orderBy("created_at", "desc")
      .limit(10)
      .get();
    const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ professional, projects, reviews });
  } catch (error) {
    // Index missing errors common in Firestore for composite queries
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update Professional Profile
app.put("/api/professionals/:id/update", authenticateToken, upload.fields([
  { name: "degree", maxCount: 1 },
  { name: "license", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "profilePic", maxCount: 1 },
]), async (req, res) => {
  try {
    const professionalId = req.params.id;
    const userId = req.user.id;

    if (professionalId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updates = { ...req.body };

    // Cleanup empty fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    if (req.files) {
      if (req.files.degree) updates.degree_document = req.files.degree[0].path;
      if (req.files.license) updates.license_document = req.files.license[0].path;
      if (req.files.profilePic) updates.profile_image = req.files.profilePic[0].path;
    }

    // Convert numbers
    if (updates.experience_years) updates.experience_years = parseInt(updates.experience_years);
    if (updates.hourly_rate) updates.hourly_rate = parseFloat(updates.hourly_rate);

    await db.collection("professionals").doc(professionalId).update(updates);

    // Fetch Updated for Token
    const updatedDoc = await db.collection("professionals").doc(professionalId).get();
    const updatedUser = updatedDoc.data();

    const newToken = jwt.sign(
      {
        id: updatedDoc.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: "professional",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Profile updated successfully",
      professionalId: professionalId,
      token: newToken,
      user: { id: updatedDoc.id, ...updatedUser }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// REVIEWS API
// ===========================
app.post("/api/reviews", authenticateToken, async (req, res) => {
  try {
    const { professional_id, project_id, rating, review_text } = req.body;
    const userId = req.user.id;

    // Get user name for the review
    const userDoc = await db.collection("users").doc(userId).get();
    const userName = userDoc.exists ? userDoc.data().name : "Anonymous";

    const newReview = {
      user_id: userId,
      user_name: userName, // Denormalize for easier fetch
      professional_id,
      project_id,
      rating: parseFloat(rating),
      review_text,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("reviews").add(newReview);

    // Update Professional Rating Aggegation
    // Note: Firestore doesn't have AVG(). We must fetch all reviews or keep a running total.
    // For scalability, running total in professional doc is better, but here we'll naive fetch.
    const reviewsSnap = await db.collection("reviews").where("professional_id", "==", professional_id).get();
    const reviews = reviewsSnap.docs.map(d => d.data());
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

    await db.collection("professionals").doc(professional_id).update({
      rating: avgRating,
      total_reviews: totalReviews
    });

    res.json({ message: "Review submitted", reviewId: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// OTHER APIs (Requirements, Cost Estimate, etc.)
// ===========================

// Requirements
app.post("/api/requirements", authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const requirement = {
      ...data,
      user_id: req.user.id,
      status: "submitted",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("requirements").add(requirement);
    res.json({ message: "Requirements saved", requirementId: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/requirements", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("requirements")
      .where("user_id", "==", req.user.id)
      .orderBy("created_at", "desc")
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cost Estimations
app.post("/api/cost-estimate", authenticateToken, async (req, res) => {
  // Simplified cost logic same as before
  const { project_type, area, location, quality_level, num_rooms } = req.body;

  const baseRates = { "3BHK": 1500, "2BHK": 1400, "1BHK": 1300, Villa: 2000, Commercial: 2500 };
  const qualityMultipliers = { Low: 0.8, Medium: 1.0, High: 1.5, Luxury: 2.0 };
  const baseRate = baseRates[project_type] || 1500;
  const multiplier = qualityMultipliers[quality_level] || 1.0;

  // Calc logic...
  const material_cost = parseFloat(area) * baseRate * multiplier * 0.4;
  const labor_cost = parseFloat(area) * baseRate * multiplier * 0.35;
  const design_cost = parseFloat(area) * baseRate * multiplier * 0.15;
  const permit_cost = parseFloat(area) * baseRate * multiplier * 0.1;
  const total_cost = material_cost + labor_cost + design_cost + permit_cost;

  const estimate = {
    user_id: req.user.id,
    project_type, area, location, quality_level, num_rooms,
    material_cost, labor_cost, design_cost, permit_cost, total_cost,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection("cost_estimations").add(estimate);
  res.json({
    message: "Estimate calculated and saved",
    estimateId: docRef.id,
    breakdown: {
      material_cost: Math.round(material_cost),
      labor_cost: Math.round(labor_cost),
      design_cost: Math.round(design_cost),
      permit_cost: Math.round(permit_cost),
      total_cost: Math.round(total_cost),
    },
  });
});

app.get("/api/cost-estimates", authenticateToken, async (req, res) => {
  const snapshot = await db.collection("cost_estimations").where("user_id", "==", req.user.id).get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// AI Design Gen (No DB changes)
app.post("/api/generate-design", upload.single("image"), async (req, res) => {
  // ... Copy existing AI logic ...
  try {
    const style = req.body.style || "modern";
    const imagePath = req.file.path;
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: fs.readFileSync(imagePath),
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      res.status(500).json({ error: "AI generation failed", details: errText });
      return;
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    fs.unlinkSync(imagePath);
    res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (err) {
    res.status(500).json({ error: "AI gen error" });
  }
});

// ===========================
// CHAT API
// ===========================
app.post("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { message, context_type } = req.body;
    const userId = req.user.id;
    // Simple response placeholder
    const response = "I'm a simple AI for now. I'll get smarter soon!";

    // In production, integrate OpenAI here

    const newChat = {
      user_id: userId,
      message,
      response,
      context_type,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("chat_messages").add(newChat);
    res.json({ message: "Chat saved", response, messageId: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/chat", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("chat_messages")
      .where("user_id", "==", req.user.id)
      .orderBy("created_at", "asc")
      .limit(50)
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// BOOKINGS API
// ===========================
app.post("/api/bookings", authenticateToken, async (req, res) => {
  try {
    const { professional_id, booking_date, booking_time, message } = req.body;
    const userId = req.user.id;

    const newBooking = {
      user_id: userId,
      professional_id,
      booking_date,
      booking_time,
      message,
      status: "pending",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("bookings").add(newBooking);
    res.json({ message: "Booking request sent", bookingId: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bookings", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("bookings")
      .where("user_id", "==", req.user.id)
      .orderBy("created_at", "desc")
      .get();

    const bookings = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      // Fetch professional details for display
      let proName = "Unknown";
      let proSpec = "";
      if (data.professional_id) {
        const proDoc = await db.collection("professionals").doc(data.professional_id).get();
        if (proDoc.exists) {
          proName = proDoc.data().name;
          proSpec = proDoc.data().specialization;
        }
      }
      return {
        id: doc.id,
        ...data,
        professional_name: proName,
        specialization: proSpec
      };
    }));

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for a user
app.get("/api/bookings/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const snapshot = await db.collection("bookings")
      .where("user_id", "==", userId)
      .get(); // Removed orderBy to avoid index error, client sort needed

    const bookings = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      // Fetch professional details
      let profName = "Unknown";
      if (data.professional_id) {
        const profDoc = await db.collection("professionals").doc(data.professional_id).get();
        if (profDoc.exists) {
          profName = profDoc.data().name;
        }
      }
      return { id: doc.id, ...data, professional_name: profName };
    }));

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for a professional
app.get("/api/bookings/professional", authenticateToken, async (req, res) => {
  try {
    const professionalId = req.user.id;
    console.log(`🔎 PING: /api/bookings/professional called by ${professionalId}`);

    const snapshot = await db.collection("bookings")
      .where("professional_id", "==", professionalId)
      .get();

    console.log(`📊 Found ${snapshot.size} bookings for ID: ${professionalId}`);

    const bookings = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      // Fetch user details
      let userName = "Unknown";
      let userEmail = "";
      let userPhone = "";
      if (data.user_id) {
        const userDoc = await db.collection("users").doc(data.user_id).get();
        if (userDoc.exists) {
          userName = userDoc.data().name;
          userEmail = userDoc.data().email;
          userPhone = userDoc.data().phone || "";
        }
      }
      return {
        id: doc.id,
        ...data,
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone
      };
    }));

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================
// COLLABORATION API
// ===========================
app.post("/api/collaborations", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { project_id, description } = req.body;
    const uploaderType = req.user.role;
    const uploaderId = req.user.id;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const newCollab = {
      project_id,
      uploader_type: uploaderType,
      uploader_id: uploaderId,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      description,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("collaborations").add(newCollab);
    res.json({ message: "File uploaded", fileId: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/collaborations/:projectId", authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection("collaborations")
      .where("project_id", "==", req.params.projectId)
      .orderBy("created_at", "desc")
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (Firestore Environment)`);
});
