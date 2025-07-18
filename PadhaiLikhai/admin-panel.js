/* * PadhaiLikhai - Admin Panel System
 * Developed by a 20-Year Full-Stack Veteran
 * Version: 30.0 (Enterprise Grade)
 */

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader-overlay');
    const panelContainer = document.getElementById('panel-container');
    const logoutBtn = document.getElementById('logout-btn');
    const usersTableBody = document.getElementById('users-table-body');

    const showLoader = () => loader.classList.remove('hidden');
    const hideLoader = () => loader.classList.add('hidden');

    const checkAuthAndLoadData = () => {
        // This function is now fail-safe.
        showLoader();
        try {
            const isAdmin = sessionStorage.getItem('isAdminAuthenticated');
            if (!isAdmin) {
                window.location.href = 'admin-login.html';
                return; // Stop execution if not authenticated
            }

            // If authenticated, show the panel immediately.
            panelContainer.classList.remove('hidden');

            const users = getAllUsers();
            usersTableBody.innerHTML = '';

            if (users.length === 0) {
                usersTableBody.innerHTML = `<tr><td colspan="7">No user data found in local database.</td></tr>`;
                return;
            }

            // Sort by most recently seen user
            users.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));

            users.forEach(user => {
                const row = document.createElement('tr');
                const lastSeenDate = user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'N/A';
                
                // Populate table with all the new data points
                row.innerHTML = `
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.class || 'N/A'}</td>
                    <td>${user.age || 'N/A'}</td>
                    <td>${user.location || 'N/A'}</td>
                    <td>${user.browser || 'N/A'}</td>
                    <td>${user.os || 'N/A'}</td>
                    <td>${lastSeenDate}</td>
                `;
                usersTableBody.appendChild(row);
            });

        } catch (error) {
            console.error("A critical error occurred in the admin panel:", error);
            usersTableBody.innerHTML = `<tr><td colspan="7">A system error occurred. Please refresh.</td></tr>`;
        } finally {
            // This GUARANTEES the loader will hide, no matter what.
            setTimeout(hideLoader, 200);
        }
    };

    logoutBtn.addEventListener('click', () => {
        showLoader();
        sessionStorage.removeItem('isAdminAuthenticated');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 500);
    });

    // Initial Load
    checkAuthAndLoadData();
});
