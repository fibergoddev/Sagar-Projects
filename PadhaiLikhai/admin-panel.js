document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loader = document.getElementById('loader-overlay');
    const panelContainer = document.getElementById('panel-container');
    const logoutBtn = document.getElementById('logout-btn');
    const usersTableBody = document.getElementById('users-table-body');

    // --- Page Protection & Data Fetching ---
    const checkAuthAndLoadData = () => {
        const isAdmin = sessionStorage.getItem('isAdminAuthenticated');

        if (!isAdmin) {
            // If not admin, redirect immediately. No need to do anything else.
            console.log('Admin not authenticated. Redirecting to login.');
            window.location.href = 'admin-login.html';
            return; // Stop execution
        }

        // If we reach here, user IS an admin. Show the panel and hide the loader.
        // This is the guaranteed fix for the stuck loader.
        panelContainer.classList.remove('hidden');
        loader.classList.add('hidden');
        
        try {
            // Now, proceed to load data from the local DB inside a try...catch block.
            console.log('Fetching data from local DB...');
            const users = getUsers(); // This now safely returns an array.

            usersTableBody.innerHTML = ''; // Clear existing table data

            if (users.length === 0) {
                usersTableBody.innerHTML = `<tr><td colspan="6">No user data found in local database.</td></tr>`;
                return;
            }

            // Sort users by last seen date, most recent first
            users.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));

            users.forEach(userData => {
                const row = document.createElement('tr');
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
        } catch (error) {
            console.error("Error while rendering user data:", error);
            usersTableBody.innerHTML = `<tr><td colspan="6">A critical error occurred while displaying data.</td></tr>`;
        }
    };

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        loader.classList.remove('hidden');
        panelContainer.classList.add('hidden');

        sessionStorage.removeItem('isAdminAuthenticated');
        console.log('Admin signed out.');
        
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 500);
    });

    // --- Initial Load ---
    checkAuthAndLoadData();
});
