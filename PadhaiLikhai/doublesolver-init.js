/* * Designed & Developed by Sagar Raj
 * Version 41: Definitive AI Doubt-Solver Initializer
 * This script's only job is to connect to Firebase for the Doubt-Solver.
 */

// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyC8kXafslLM647EOpzZZ3F7oVoaa0u8ieo",
    authDomain: "padhailikhai-app.firebaseapp.com",
    projectId: "padhailikhai-app",
    storageBucket: "padhailikhai-app.appspot.com", // Corrected URL
    messagingSenderId: "205786528118",
    appId: "1:205786528118:web:2f09f0a2073144f3846257",
    measurementId: "G-4MGMPE2DYV"
};

// --- Unbreakable Initialization Sequence ---
async function initializeSolverFirebase() {
    try {
        // Step 1: Initialize the Firebase app with a unique name to prevent conflicts.
        const app = initializeApp(firebaseConfig, "doubtSolverApp");

        // Step 2: Get all necessary Firebase services.
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Step 3: Sign the user in anonymously to get a stable user ID.
        const userCredential = await signInAnonymously(auth);
        const userId = userCredential.user.uid;

        // Step 4: ** THE FLARE GUN **
        // Fire a "solverFirebaseReady" custom event to signal the main script.
        const event = new CustomEvent('solverFirebaseReady', {
            detail: { auth, db, userId }
        });
        document.dispatchEvent(event);

    } catch (error) {
        // If any part of the connection fails, fire a "solverFirebaseFailed" event.
        console.error("Definitive Solver Firebase Initialization Error:", error);
        const event = new CustomEvent('solverFirebaseFailed', {
            detail: { error }
        });
        document.dispatchEvent(event);
    }
}

// Execute the initialization sequence.
initializeSolverFirebase();
