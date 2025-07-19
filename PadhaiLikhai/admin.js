/* * Designed & Developed by Sagar Raj
 * Version 30: Static Hosting Firebase Fix
 */

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- DOM Element Cache ---
const loginView = document.getElementById('admin-login-view');
const dashboardView = document.getElementById('admin-dashboard-view');
const loginForm = document.getElementById('admin-login-form');
const errorMsg = document.getElementById('login-error-msg');
const userTableBody = document.querySelector('#user-data-table tbody');
const logoutBtn = document.getElementById('logout-btn');
const notificationContainer = document.getElementById('notification-container');

// --- App State ---
let db;
let auth;
let usersUnsubscribe = null; // To store the listener unsubscribe function

// --- Notification System ---
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    if (type === 'error') iconClass = 'fas fa-times-circle';
    notification.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    notificationContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
};

// --- UI Management ---
const showLogin = () => {
    loginView.classList.add('visible');
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    if (usersUnsubscribe) usersUnsubscribe(); // Stop listening for data if logged out
};

const showDashboard = () => {
    loginView.classList.remove('visible');
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    listenForUsers(); // Start listening for user data
};

// --- Firebase Logic ---
const listenForUsers = () => {
    if (!db) return;
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('lastVisited', 'desc'));

    usersUnsubscribe = onSnapshot(q, (snapshot) => {
        userTableBody.innerHTML = ''; // Clear table
        if (snapshot.empty) {
            userTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No user data yet. Waiting for visitors...</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const user = doc.data();
            const row = document.createElement('tr');
            const lastVisited = user.lastVisited ? new Date(user.lastVisited.seconds * 1000).toLocaleString() : 'N/A';
            
            row.innerHTML = `
                <td data-label="User ID">${user.id || 'N/A'}</td>
                <td data-label="Name">${user.name || 'N/A'}</td>
                <td data-label="Class">${user.class || 'N/A'}</td>
                <td data-label="Age">${user.age || 'N/A'}</td>
                <td data-label="Device">${user.device?.type || 'N/A'} (${user.device?.os || 'N/A'})</td>
                <td data-label="Location">${user.location?.city || 'N/A'}, ${user.location?.country || 'N/A'}</td>
                <td data-label="Last Visited">${lastVisited}</td>
            `;
            userTableBody.appendChild(row);
        });
    }, (error) => {
        console.error("Error listening to user data:", error);
        if (error.code === 'failed-precondition') {
             showNotification("Firestore index required. Check console for link to create it.", "error");
        } else {
             showNotification("Error fetching real-time data.", "error");
        }
    });
};

// --- Event Listeners ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Auth state change will handle showing the dashboard
    } catch (err) {
        console.error('Admin login error:', err);
        errorMsg.textContent = "Invalid email or password.";
        errorMsg.style.display = 'block';
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // Auth state change will handle showing the login page
        showNotification("Logged out successfully.", "info");
    } catch (error) {
        console.error("Logout error:", error);
    }
});

// --- App Initialization ---
async function initializeAdminApp() {
    if (typeof window.firebaseConfig === 'undefined' || !window.firebaseConfig.apiKey) {
        showNotification("Firebase is not configured correctly.", "error");
        console.error("Firebase config is missing. Please add it to admin.html");
        return;
    }
    const app = initializeApp(window.firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            showDashboard();
        } else {
            // User is signed out
            showLogin();
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeAdminApp);
