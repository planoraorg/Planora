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
    `;

    // Insert footer at the end of body
    const footerContainer = document.getElementById('planora-footer');
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanoraFooter);
} else {
    initPlanoraFooter();
}
