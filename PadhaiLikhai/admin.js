/*
 * PadhaiLikhai - Admin Dashboard Logic by Sagar Raj
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    const loginForm = document.getElementById('admin-login-form');
    const errorMsg = document.getElementById('login-error-msg');
    const userTableBody = document.querySelector('#user-data-table tbody');
    const logoutBtn = document.getElementById('logout-btn');
    const notificationContainer = document.getElementById('notification-container');

    const API_BASE_URL = 'http://localhost:3000/api';

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

    // --- Authentication ---
    const checkAuth = () => {
        if (sessionStorage.getItem('isAdminAuthenticated')) {
            showDashboard();
        } else {
            showLogin();
        }
    };

    const showLogin = () => {
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    };

    const showDashboard = async () => {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        await fetchAndDisplayUsers();
    };
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                showNotification('Login successful!', 'success');
                showDashboard();
            } else {
                errorMsg.textContent = result.message || 'Login failed.';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            console.error('Login fetch error:', err);
            errorMsg.textContent = 'An error occurred. Please try again.';
            errorMsg.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        showNotification('Logged out successfully.', 'info');
        showLogin();
    });

    // --- Data Fetching and Display ---
    const fetchAndDisplayUsers = async () => {
        try {
            // This endpoint should be protected in a real application
            const response = await fetch(`${API_BASE_URL}/admin/users`);
            const users = await response.json();

            userTableBody.innerHTML = ''; // Clear existing data
            if (users.length === 0) {
                userTableBody.innerHTML = '<tr><td colspan="8">No user data found.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id || 'N/A'}</td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.class || 'N/A'}</td>
                    <td>${user.age || 'N/A'}</td>
                    <td>${user.device?.type || 'N/A'} (${user.device?.os || 'N/A'})</td>
                    <td>${user.location?.city || 'N/A'}, ${user.location?.country || 'N/A'}</td>
                    <td>${user.ipAddress || 'N/A'}</td>
                    <td>${new Date(user.lastVisited).toLocaleString()}</td>
                `;
                userTableBody.appendChild(row);
            });
        } catch (err) {
            console.error('Error fetching user data:', err);
            showNotification('Failed to load user data.', 'error');
            userTableBody.innerHTML = `<tr><td colspan="8">Error loading data.</td></tr>`;
        }
    };

    // --- Initial Load ---
    checkAuth();
});
