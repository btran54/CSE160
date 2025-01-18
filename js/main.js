// Global variables
let sidebarOpen = false;
const SIDEBAR_WIDTH = '250px';

// Make these functions available globally
window.openNav = function() {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const openBtn = document.querySelector('.openbtn');
    
    sidebar.style.width = SIDEBAR_WIDTH;
    main.style.marginLeft = SIDEBAR_WIDTH;
    openBtn.style.display = 'none';  // Hide the hamburger button
    sidebarOpen = true;
};

window.closeNav = function() {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const openBtn = document.querySelector('.openbtn');
    
    sidebar.style.width = '0';
    main.style.marginLeft = '0';
    openBtn.style.display = 'block';  // Show the hamburger button
    sidebarOpen = false;
};

// Handles window resize events
function handleResize() {
    if (window.innerWidth <= 768 && sidebarOpen) {
        window.closeNav();
    }
}

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarOpen) {
            window.closeNav();
        }
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Set active page
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar a');
    
    links.forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
});