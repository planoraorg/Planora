document.addEventListener("DOMContentLoaded", () => {
  const chatbotButton = document.getElementById("chatbot-button");
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");

  chatbotButton.addEventListener("click", () => {
    chatbotContainer.classList.toggle("hidden");
  });

  chatbotClose.addEventListener("click", () => {
    chatbotContainer.classList.add("hidden");
  });

  chatbotSend.addEventListener("click", sendMessage);
  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, "user-message");
    chatbotInput.value = "";

    setTimeout(() => {
      const response = getBotResponse(message);
      addMessage(response, "bot-message");
    }, 600);
  }

  function addMessage(text, className) {
    const div = document.createElement("div");
    div.classList.add("message", className);
    div.innerHTML = text;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function getBotResponse(input) {
    input = input.toLowerCase();

    if (input.includes("architect")) {
      return "You can contact architects here: <a href='mailto:architect@planora.com'>architect@planora.com</a>";
    } else if (input.includes("electrician")) {
      return "Electricians near you: Rahul (+91 9876543234), Aman (+91 9876543245)";
    } else if (input.includes("plumber")) {
      return "Plumbers: Ramesh (+91 9876543210), Suresh (+91 9876543221)";
    } else if (input.includes("hello") || input.includes("hi")) {
      return "Hi there 👋! How can I help you today?";
    } else {
      return "I’m not sure, but you can reach our support team at support@planora.com.";
    }
  }
});

