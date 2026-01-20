/**
 * Authentication Utilities for Client-Side
 * Handles JWT token storage, retrieval, and user session management
 */

// Check if user is authenticated
function isAuthenticated() {
  const token = localStorage.getItem('planora_token');
  return token !== null && token !== undefined;
}

// Get user data from token
function getUserData() {
  const token = localStorage.getItem('planora_token');
  if (!token) return null;

  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    console.error('Invalid token:', e);
    return null;
  }
}

// Save authentication token
function saveAuthToken(token) {
  localStorage.setItem('planora_token', token);
}

// Logout user
function logout() {
  localStorage.removeItem('planora_token');
  window.location.href = '/pages/public/home.html';
}

// Get authorization header for API requests
function getAuthHeader() {
  const token = localStorage.getItem('planora_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Check authentication and redirect if needed
function requireAuth(redirectUrl = '/pages/public/login.html') {
  if (!isAuthenticated()) {
    window.location.href = redirectUrl;
    return false;
  }
  return true;
}

// function updateNavbar() { ... } removed to avoid conflict with navbar.js

// Initialize auth on page load
// Navbar initialization moved to navbar.js

// Make functions globally available
window.isAuthenticated = isAuthenticated;
window.getUserData = getUserData;
window.saveAuthToken = saveAuthToken;
window.logout = logout;
window.getAuthHeader = getAuthHeader;
window.requireAuth = requireAuth;
window.requireAuth = requireAuth;
// window.updateNavbar removed
