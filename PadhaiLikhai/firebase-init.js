/* * Designed & Developed by Sagar Raj
 * Version 46: Definitive Firebase Initializer with Connection Retry
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
    storageBucket: "padhailikhai-app.appspot.com",
    messagingSenderId: "205786528118",
    appId: "1:205786528118:web:2f09f0a2073144f3846257",
    measurementId: "G-4MGMPE2DYV"
};

// --- Definitive Initialization Sequence with Retry Logic ---
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function initializeFirebase() {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Firebase: Attempting connection ${attempt}/${MAX_RETRIES}...`);
            
            // Step 1: Initialize the Firebase app.
            const app = initializeApp(firebaseConfig);

            // Step 2: Get all necessary Firebase services.
            const auth = getAuth(app);
            const db = getFirestore(app);
            const analytics = getAnalytics(app);

            // Step 3: Sign the user in anonymously. This is a critical check.
            const userCredential = await signInAnonymously(auth);
            const userId = userCredential.user.uid;

            // Step 4: ** THE FLARE GUN ** - Success
            // If all previous steps succeeded, fire a "firebaseReady" custom event.
            console.log("Firebase: Connection successful.");
            const event = new CustomEvent('firebaseReady', {
                detail: { auth, db, analytics, userId }
            });
            document.dispatchEvent(event);
            return; // Exit the function successfully

        } catch (error) {
            // Log the specific error for this attempt
            console.error(`Firebase: Connection attempt ${attempt} failed.`, error);

            if (attempt === MAX_RETRIES) {
                // If this was the last attempt, dispatch the failure event
                console.error("Firebase: All connection attempts failed.");
                const event = new CustomEvent('firebaseFailed', {
                    detail: { error }
                });
                document.dispatchEvent(event);
            } else {
                // Wait for the delay before the next attempt
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }
}

// Execute the initialization sequence.
initializeFirebase();
