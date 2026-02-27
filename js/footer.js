// Planora Common Footer System
// Injects "Get in Touch" section and footer on all pages

function initPlanoraFooter() {
    const footerHTML = `
        <!-- Get in Touch Section -->
        <section id="contact" class="py-3 text-center" style="background: #ffffff;">
            <div class="container">
                <h2 style="font-weight: 700; font-size: 1.5rem; color: #14213d; margin-bottom: 10px;">Get in Touch</h2>
                <p style="color: #555; font-size: 0.9rem; margin-bottom: 15px;">Have questions or want to collaborate with us? Let's talk.</p>
                <a href="/pages/public/contact.html" class="btn" style="background: #ffb703; color: white; font-weight: 600; padding: 10px 30px; border-radius: 25px; border: none; font-size: 0.95rem; text-decoration: none; display: inline-block;">Contact Us</a>
            </div>
        </section>

        <!-- Footer -->
        <footer style="background: linear-gradient(90deg, #1a1f3a, #2a3550); color: white; text-align: center; padding: 20px 0;">
            <div class="container">
                <p style="margin-bottom: 8px; font-size: 15px;">© 2026 Planora</p>
                <p style="margin: 0; font-size: 14px;">
                    Follow us: 
                    <a href="https://www.instagram.com/planora_org/" target="_blank" style="color: #4a9eff; text-decoration: none; margin: 0 8px;"> Instagram</a>
                </p>
            </div>
        </footer>
        
        <!-- Global AI Chatbot Floating Button & Popup Widget -->
        <div id="planora-chatbot-wrapper" style="position: fixed; bottom: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end;">
            
            <!-- Chat Window (Hidden by Default) -->
            <div id="ai-chat-window" style="display: none; width: 350px; height: 500px; background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; flex-direction: column; margin-bottom: 15px; border: 1px solid #eee; transition: all 0.3s ease;">
                
                <!-- Chat Header -->
                <div style="background: linear-gradient(135deg, #1a1f3a, #ffb703); padding: 15px 20px; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-robot" style="font-size: 1.4rem; text-shadow: 0 2px 4px rgba(0,0,0,0.2);"></i>
                        <div style="line-height: 1.2;">
                            <h5 style="margin: 0; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.5px;">P-Link Ai</h5>
                            <span style="font-size: 0.75rem; opacity: 0.9;">Intelligent Support</span>
                        </div>
                    </div>
                    <button onclick="toggleChatWindow()" style="background: none; border: none; color: white; cursor: pointer; opacity: 0.8; transition: opacity 0.2s;"><i class="fas fa-times"></i></button>
                </div>

                <!-- Chat Body container -->
                <div id="ai-chat-body" style="flex: 1; padding: 15px; overflow-y: auto; background: #fafbfc; display: flex; flex-direction: column; gap: 12px; font-family: 'Poppins', sans-serif;">
                    
                    <!-- Default Initial Message -->
                    <div style="background: #e3f2fd; color: #084298; padding: 10px 15px; border-radius: 15px; border-bottom-left-radius: 5px; max-width: 85%; align-self: flex-start; font-size: 0.9rem; line-height: 1.4; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        Hi! 👋 I'm <b>P-Link Ai</b>. Whether you're a homeowner looking for professionals, or a professional needing help with your dashboard, I'm here to answer your doubts and guide you! What's on your mind?
                    </div>

                </div>

                <!-- AI Typing Indicator (Hidden default) -->
                <div id="ai-typing-indicator" style="display: none; padding: 5px 15px; font-size: 0.8rem; color: #6c757d; font-style: italic; background: #fafbfc;">AI is thinking...</div>

                <!-- Chat Footer input area -->
                <div style="padding: 12px 15px; background: white; border-top: 1px solid #f1f1f1; display: flex; gap: 8px;">
                    <input type="text" id="ai-chat-input" placeholder="Type a message..." style="flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 8px 15px; font-size: 0.9rem; outline: none;">
                    <button id="ai-chat-send" style="background: #0d6efd; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: transform 0.2s;"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>

            <style>
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 183, 3, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(255, 183, 3, 0); }
                    100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 183, 3, 0); }
                }
                .plink-ai-btn {
                    width: 65px; height: 65px; 
                    background: linear-gradient(135deg, #1a1f3a, #2a3550); 
                    color: #ffb703; 
                    border: 2px solid #ffb703;
                    border-radius: 50%; 
                    display: flex; justify-content: center; align-items: center; 
                    font-size: 28px; 
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); 
                    cursor: pointer; transition: all 0.3s ease;
                    animation: pulse-ring 2s infinite;
                }
                .plink-ai-btn:hover {
                    transform: scale(1.1) !important;
                    background: #ffb703;
                    color: #1a1f3a;
                    border-color: #1a1f3a;
                    animation: none;
                }
            </style>
            <!-- Floating Toggle Button -->
            <button onclick="toggleChatWindow()" class="plink-ai-btn" title="Ask P-Link Ai">
                <i class="fas fa-headset"></i>
            </button>
        </div>
    `;

    // Insert footer at the end of body
    const footerContainer = document.getElementById('planora-footer');
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
        // Assign event handlers strictly after the HTML is injected
        setupChatLogic();
    }
}

// Global Chat state and UI logic
let aiChatHistory = [];

function toggleChatWindow() {
    const chatWindow = document.getElementById('ai-chat-window');
    const inputField = document.getElementById('ai-chat-input');
    if (chatWindow.style.display === 'none') {
        chatWindow.style.display = 'flex';
        sessionStorage.setItem('planora_chat_open', 'true');
        setTimeout(() => inputField.focus(), 100);
    } else {
        chatWindow.style.display = 'none';
        sessionStorage.setItem('planora_chat_open', 'false');
    }
}

function setupChatLogic() {
    const inputField = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendChatMessage();
    });
    sendBtn.addEventListener('click', handleSendChatMessage);

    // Restore chat history gracefully from session storage
    const savedHistory = sessionStorage.getItem('planora_chat_history');
    if (savedHistory) {
        try {
            const parsedHistory = JSON.parse(savedHistory);
            if (parsedHistory && parsedHistory.length > 0) {
                aiChatHistory = parsedHistory;
                aiChatHistory.forEach(msg => {
                    appendUIChatMessage(msg.content, msg.role === 'assistant' ? 'ai' : 'user');
                });

                // Keep the chat window fully scrolled down
                const chatBody = document.getElementById('ai-chat-body');
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        } catch (e) {
            console.error("Failed to restore P-Link Ai chat history", e);
        }
    }

    // Restore chat window visibility state explicitly
    if (sessionStorage.getItem('planora_chat_open') === 'true') {
        document.getElementById('ai-chat-window').style.display = 'flex';
    }
}

function appendUIChatMessage(text, type) {
    const chatBody = document.getElementById('ai-chat-body');
    const msgDiv = document.createElement('div');

    if (type === 'user') {
        msgDiv.style.cssText = "background: #0d6efd; color: white; padding: 10px 15px; border-radius: 15px; border-bottom-right-radius: 5px; max-width: 85%; align-self: flex-end; font-size: 0.9rem; line-height: 1.4;";
    } else if (type === 'ai') {
        msgDiv.style.cssText = "background: #e3f2fd; color: #084298; padding: 10px 15px; border-radius: 15px; border-bottom-left-radius: 5px; max-width: 85%; align-self: flex-start; font-size: 0.9rem; line-height: 1.4;";
    } else if (type === 'system') {
        msgDiv.style.cssText = "background: #d1e7dd; color: #0f5132; padding: 10px 15px; border-radius: 15px; max-width: 90%; align-self: center; font-size: 0.85rem; font-weight: bold; text-align: center; margin-top: 5px;";
    }

    msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

async function handleSendChatMessage() {
    const inputField = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const typingIndicator = document.getElementById('ai-typing-indicator');

    const text = inputField.value.trim();
    if (!text) return;

    // Display user message
    appendUIChatMessage(text, 'user');
    inputField.value = '';

    // Disable inputs while waiting
    inputField.disabled = true;
    sendBtn.disabled = true;
    typingIndicator.style.display = 'block';
    document.getElementById('ai-chat-body').scrollTop = document.getElementById('ai-chat-body').scrollHeight;

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (localStorage.getItem('planora_token')) {
            headers['Authorization'] = `Bearer ${localStorage.getItem('planora_token')}`;
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ message: text, history: aiChatHistory })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'API Error');

        // Display AI message
        appendUIChatMessage(data.message, 'ai');

        // Save to context history
        aiChatHistory.push({ role: 'user', content: text });
        aiChatHistory.push({ role: 'assistant', content: data.message });
        if (aiChatHistory.length > 6) aiChatHistory = aiChatHistory.slice(aiChatHistory.length - 6);
        sessionStorage.setItem('planora_chat_history', JSON.stringify(aiChatHistory));

        // Handle possible automatic redirect
        if (data.redirect_url) {
            appendUIChatMessage(`<i class="fas fa-spinner fa-spin me-2"></i> Redirecting you now...`, 'system');
            setTimeout(() => {
                window.location.href = data.redirect_url;
            }, 1800);
        }

    } catch (error) {
        appendUIChatMessage("⚠️ Connectivity error. Please check server and API keys.", 'ai');
        console.error("Chat Error: ", error);
    } finally {
        inputField.disabled = false;
        sendBtn.disabled = false;
        typingIndicator.style.display = 'none';
        inputField.focus();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanoraFooter);
} else {
    initPlanoraFooter();
}
