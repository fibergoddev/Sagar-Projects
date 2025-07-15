document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const errorMessage = document.getElementById('login-error-message');
    const loader = document.getElementById('loader-overlay');

    // --- Event Listeners ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from submitting the traditional way
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        errorMessage.textContent = ''; // Clear previous errors
        loader.classList.remove('hidden'); // Show loader

        // --- Local Authentication ---
        // Get the hardcoded credentials from our local DB helper.
        const adminCreds = getAdminCredentials();

        // Simulate a network delay for better UX
        setTimeout(() => {
            if (email === adminCreds.email && password === adminCreds.password) {
                // If credentials match, set a flag in sessionStorage and redirect.
                // sessionStorage is used so the login state is cleared when the browser tab is closed.
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                console.log('Admin authenticated successfully.');
                window.location.href = 'admin-panel.html';
            } else {
                // If credentials do not match, show an error.
                console.error('Admin login failed: Invalid credentials.');
                errorMessage.textContent = 'Invalid email or password.';
                loader.classList.add('hidden'); // Hide loader on error
            }
        }, 1000); // 1-second delay
    });
});
