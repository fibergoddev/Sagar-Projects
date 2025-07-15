document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loader = document.getElementById('loader-overlay');
    const panelContainer = document.getElementById('panel-container');
    const logoutBtn = document.getElementById('logout-btn');
    const usersTableBody = document.getElementById('users-table-body');

    // --- Page Protection & Data Fetching ---
    const checkAuthAndLoadData = () => {
        // Check sessionStorage to see if the admin is authenticated.
        const isAdmin = sessionStorage.getItem('isAdminAuthenticated');

        if (isAdmin) {
            // Admin is authenticated, proceed to load data.
            console.log('Admin authenticated. Fetching data from local DB...');
            panelContainer.classList.remove('hidden');
            loader.classList.add('hidden');

            const users = getUsers(); // Get users from localDB.js
            usersTableBody.innerHTML = ''; // Clear existing table data

            if (users.length === 0) {
                usersTableBody.innerHTML = `<tr><td colspan="6">No user data found in local database.</td></tr>`;
                return;
            }

            users.forEach(userData => {
                const row = document.createElement('tr');
                
                // Format the timestamp to a readable date and time
                const lastSeenDate = userData.lastSeen ? new Date(userData.lastSeen).toLocaleString() : 'N/A';

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

        } else {
            // No admin auth found, redirect to the login page.
            console.log('Admin not authenticated. Redirecting to login.');
            window.location.href = 'admin-login.html';
        }
    };

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        loader.classList.remove('hidden');
        // Clear the session flag to log out.
        sessionStorage.removeItem('isAdminAuthenticated');
        console.log('Admin signed out.');
        
        // Redirect to login page after a short delay.
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 500);
    });

    // --- Initial Load ---
    checkAuthAndLoadData();
});
