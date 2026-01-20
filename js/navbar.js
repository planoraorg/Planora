/**
 * Centralized Navigation System for Planora
 * Handles navbar rendering for public and authenticated users
 */

// Navigation configuration
const navConfig = {
    public: [
        { name: 'Home', url: '/pages/public/home.html', icon: 'fa-home' },
        { name: 'About Us', url: '/pages/public/about.html', icon: 'fa-info-circle' },
        { name: 'Tools/Features', url: '/pages/tools/features.html', icon: 'fa-tools' },
        { name: 'Projects', url: '/pages/projects/gallery.html', icon: 'fa-folder-open' },
        { name: 'Professionals', url: '/pages/professional/browse.html', icon: 'fa-users' }
    ],
    authenticated: {
        user: [
            { name: 'Home', url: '/pages/public/home.html', icon: 'fa-home' },
            { name: 'Dashboard', url: '/pages/user/dashboard.html', icon: 'fa-tachometer-alt' },
            { name: 'Tools', url: '/pages/tools/features.html', icon: 'fa-tools' },
            { name: 'Projects', url: '/pages/projects/gallery.html', icon: 'fa-folder-open' },
            { name: 'Professionals', url: '/pages/professional/browse.html', icon: 'fa-users' }
        ],
        professional: [
            { name: 'Home', url: '/pages/public/home.html', icon: 'fa-home' },
            { name: 'Dashboard', url: '/pages/professional/dashboard.html', icon: 'fa-tachometer-alt' },
            { name: 'Tools', url: '/pages/tools/features.html', icon: 'fa-tools' },
            { name: 'Projects', url: '/pages/projects/gallery.html', icon: 'fa-folder-open' },
            { name: 'Professionals', url: '/pages/professional/browse.html', icon: 'fa-users' }
        ]
    }
};

// Render navbar HTML
function renderNavbar() {
    const userData = getUserData();
    const isAuth = userData !== null;
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';

    let navItems;
    if (isAuth) {
        navItems = navConfig.authenticated[userData.role] || navConfig.authenticated.user;
    } else {
        navItems = navConfig.public;
    }

    // Build navigation items
    const navHTML = navItems.map(item => {
        const isActive = currentPage === item.url;
        return `
            <li class="nav-item">
                <a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}">
                    ${item.name}
                </a>
            </li>
        `;
    }).join('');

    // Build auth section
    let authSection;
    if (isAuth) {
        authSection = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" 
                   data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle"></i> ${userData.name || 'Profile'}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item" href="${userData.role === 'professional' ? '/pages/professional/edit-profile.html' : '/pages/user/profile.html'}">
                        <i class="fas fa-user-edit"></i> Profile Settings</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout(); return false;">
                        <i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </li>
        `;
    } else {
        authSection = `
            <li class="nav-item ms-2">
                <button class="btn" data-bs-toggle="modal" data-bs-target="#authModal" 
                        style="background: rgba(255, 255, 255, 0.1); 
                               border: 1px solid rgba(255, 255, 255, 0.3); 
                               color: white; 
                               font-weight: 500; 
                               padding: 8px 20px; 
                               border-radius: 8px;
                               font-size: 0.95rem;
                               transition: all 0.3s ease;"
                        onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.borderColor='rgba(255, 255, 255, 0.5)';"
                        onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(255, 255, 255, 0.3)';">
                    <i class="fas fa-user me-2"></i>Sign In
                </button>
            </li>
        `;
    }

    return `
        <nav class="navbar navbar-expand-lg navbar-dark sticky-top" 
             style="background: linear-gradient(90deg, #141032, #182030); box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            <div class="container-fluid">
                <a class="navbar-brand d-flex align-items-center" href="/pages/public/home.html">
                    <img src="/icon/Planora-logo-removebg-preview.png" alt="Planora" height="55" class="me-3">
                    <div style="line-height: 1.1;">
                        <span style="font-weight: 700; font-size: 1.8rem; color: white; display: block; letter-spacing: 1px;">PLANORA</span>
                        <span style="font-size: 0.65rem; color: white; opacity: 0.85; font-style: italic; text-transform: uppercase; letter-spacing: 0.5px;">Plan According to Your Aura</span>
                    </div>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        ${navHTML}
                        ${authSection}
                    </ul>
                </div>
            </div>
        </nav>
        
        <!-- Auth Modal -->
        <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="background: linear-gradient(135deg, #1e3c72, #2a5298); color: white; border: none; border-radius: 20px;">
                    <div class="modal-header border-0">
                        <h5 class="modal-title">Welcome to Planora</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <p class="mb-4">Choose how you'd like to continue:</p>
                        <div class="d-grid gap-3">
                            <a href="/pages/public/login.html" class="btn btn-lg" style="background: white; color: #1e3c72; font-weight: 600; border-radius: 12px; padding: 15px;">
                                <i class="fas fa-sign-in-alt me-2"></i>Login to Existing Account
                            </a>
                            <a href="/pages/public/register.html" class="btn btn-lg" style="background: #ffb703; color: #141032; font-weight: 600; border-radius: 12px; padding: 15px;">
                                <i class="fas fa-user-plus me-2"></i>Create New Account
                            </a>
                        </div>
                        <p class="mt-4 mb-0" style="font-size: 0.9rem; opacity: 0.9;">
                            New customer? <a href="register.html" style="color: #ffb703; text-decoration: none; font-weight: 600;">Start here.</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize navbar on page load
document.addEventListener('DOMContentLoaded', function () {
    const navbarContainer = document.getElementById('planora-navbar');
    if (navbarContainer) {
        navbarContainer.innerHTML = renderNavbar();

        // Initialize Bootstrap dropdowns after navbar is rendered
        // This ensures dropdowns work even if Bootstrap JS loads after navbar rendering
        setTimeout(() => {
            const dropdownElementList = navbarContainer.querySelectorAll('.dropdown-toggle');
            if (dropdownElementList.length > 0 && typeof bootstrap !== 'undefined') {
                dropdownElementList.forEach(dropdownToggleEl => {
                    new bootstrap.Dropdown(dropdownToggleEl);
                });
            }
        }, 100);
    }
});

// Helper function for protected navigation
window.navigateWithAuth = function (url) {
    if (!isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', url);
        window.location.href = 'login.html';
    } else {
        window.location.href = url;
    }
};
