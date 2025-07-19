/* * Designed & Developed by Sagar Raj
 * Version 39: Definitive Firebase Initializer
 * This script's only job is to connect to Firebase and dispatch a success or fail event.
 */

// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

// --- Firebase Configuration ---
// This is the corrected, definitive configuration.
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
async function initializeFirebase() {
    try {
        // Step 1: Initialize the Firebase app with the corrected configuration.
        const app = initializeApp(firebaseConfig);

        // Step 2: Get all necessary Firebase services.
        const auth = getAuth(app);
        const db = getFirestore(app);
        const analytics = getAnalytics(app);

        // Step 3: Sign the user in anonymously. This is a critical check.
        const userCredential = await signInAnonymously(auth);
        const userId = userCredential.user.uid;

        // Step 4: ** THE FLARE GUN **
        // If all previous steps succeeded, fire a "firebaseReady" custom event.
        // This signal tells the main script that it is now safe to load.
        // We pass all the initialized services and the userId in the event's detail.
        const event = new CustomEvent('firebaseReady', {
            detail: { auth, db, analytics, userId }
        });
        document.dispatchEvent(event);

    } catch (error) {
        // If any part of the connection fails, fire a "firebaseFailed" event.
        console.error("Definitive Firebase Initialization Error:", error);
        const event = new CustomEvent('firebaseFailed', {
            detail: { error }
        });
        document.dispatchEvent(event);
    }
}

// Execute the initialization sequence.
initializeFirebase();
