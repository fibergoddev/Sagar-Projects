document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT: Firebase Configuration ---
    // Replace with your own Firebase project configuration.
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // --- Initialize Firebase ---
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();

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

        // --- Firebase Authentication ---
        // This is a secure way to sign in. Credentials are not stored in the code.
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in successfully
                console.log('Admin signed in:', userCredential.user);
                window.location.href = 'admin-panel.html'; // Redirect to the admin panel
            })
            .catch((error) => {
                // Handle Errors here.
                console.error("Admin Login Error:", error);
                switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage.textContent = 'Invalid email or password.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage.textContent = 'Please enter a valid email address.';
                        break;
                    default:
                        errorMessage.textContent = 'An error occurred. Please try again.';
                        break;
                }
                loader.classList.add('hidden'); // Hide loader on error
            });
    });
});
