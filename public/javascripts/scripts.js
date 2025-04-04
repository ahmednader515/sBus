const loadingOverlay = document.getElementById('loading-overlay');

// Show loading on form submission
document.addEventListener('submit', () => {
    loadingOverlay.style.display = 'flex';
});

// Show loading on link click (for internal links)
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Only show loading if the link has an explicit href attribute
        if (link.hasAttribute('href') && link.getAttribute('href') !== '#' && link.href.startsWith(window.location.origin)) {
            loadingOverlay.style.display = 'flex';
        }
    });
});

// Hide loading when the page finishes loading (including back navigation)
window.addEventListener('pageshow', () => {
    loadingOverlay.style.display = 'none';
});

