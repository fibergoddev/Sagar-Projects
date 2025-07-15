document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const errorMessage = document.getElementById('login-error-message');
    const loader = document.getElementById('loader-overlay');

    // --- Event Listeners ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        errorMessage.textContent = ''; 
        loader.classList.remove('hidden');

        // --- Local Authentication ---
        // Use the robust function from our local DB helper.
        const adminCreds = getAdminCredentials();

        // Simulate a network delay for better UX
        setTimeout(() => {
            if (email === adminCreds.email && password === adminCreds.password) {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                console.log('Admin authenticated successfully.');
                window.location.href = 'admin-panel.html';
            } else {
                console.error('Admin login failed: Invalid credentials.');
                errorMessage.textContent = 'Invalid email or password.';
                loader.classList.add('hidden');
            }
        }, 500); // Shorter delay
    });
});
