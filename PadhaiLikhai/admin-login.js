/* * PadhaiLikhai - Admin Login System
 * Developed by a 20-Year Full-Stack Veteran
 * Version: 30.0 (Enterprise Grade)
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const errorMessage = document.getElementById('login-error-message');
    const loader = document.getElementById('loader-overlay');

    const showLoader = () => loader.classList.remove('hidden');
    const hideLoader = () => loader.classList.add('hidden');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showLoader();
        errorMessage.textContent = '';

        try {
            const enteredEmail = emailInput.value;
            const enteredPassword = passwordInput.value;
            const adminCreds = getAdminCredentials();

            // Simulate a secure, timed check
            setTimeout(() => {
                if (enteredEmail === adminCreds.email && enteredPassword === adminCreds.password) {
                    // Use sessionStorage for secure, session-only authentication
                    sessionStorage.setItem('isAdminAuthenticated', 'true');
                    window.location.href = 'admin-panel.html';
                } else {
                    errorMessage.textContent = 'Invalid email or password.';
                    hideLoader();
                }
            }, 500);

        } catch (error) {
            console.error("A critical error occurred during login:", error);
            errorMessage.textContent = 'A system error occurred. Please try again.';
            hideLoader();
        }
    });
});
