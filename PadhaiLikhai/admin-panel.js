document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT: Firebase Configuration ---
    // Use the same Firebase config as in your other files.
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
    const db = firebase.firestore();

    // --- DOM Elements ---
    const loader = document.getElementById('loader-overlay');
    const panelContainer = document.getElementById('panel-container');
    const logoutBtn = document.getElementById('logout-btn');
    const usersTableBody = document.getElementById('users-table-body');

    // --- Page Protection & Data Fetching ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in, show the panel and fetch data
            console.log('Admin authenticated. Fetching data...');
            panelContainer.classList.remove('hidden');
            loader.classList.add('hidden');
            
            // Listen for real-time updates from the 'users' collection
            db.collection('users').onSnapshot(snapshot => {
                usersTableBody.innerHTML = ''; // Clear existing table data
                if (snapshot.empty) {
                    usersTableBody.innerHTML = `<tr><td colspan="6">No user data found.</td></tr>`;
                    return;
                }
                snapshot.forEach(doc => {
                    const userData = doc.data();
                    const row = document.createElement('tr');
                    
                    // Format the timestamp to a readable date and time
                    const lastSeenDate = userData.lastSeen ? new Date(userData.lastSeen.seconds * 1000).toLocaleString() : 'N/A';

                    row.innerHTML = `
                        <td>${userData.name || 'N/A'}</td>
                        <td>${userData.class || 'N/A'}</td>
                        <td>${userData.age || 'N/A'}</td>
                        <td>${userData.ipAddress || 'N/A'}</td>
                        <td><small>${userData.deviceInfo || 'N/A'}</small></td>
                        <td>${lastSeenDate}</td>
                    `;
                    usersTableBody.appendChild(row);
                });
            }, error => {
                console.error("Error fetching user data: ", error);
                usersTableBody.innerHTML = `<tr><td colspan="6">Error loading data.</td></tr>`;
            });

        } else {
            // No user is signed in, redirect to the login page.
            console.log('Admin not authenticated. Redirecting to login.');
            window.location.href = 'admin-login.html';
        }
    });

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        loader.classList.remove('hidden');
        auth.signOut().then(() => {
            console.log('Admin signed out.');
            // The onAuthStateChanged listener will automatically redirect to login.
        }).catch(error => {
            console.error('Sign out error', error);
            loader.classList.add('hidden');
        });
    });
});
