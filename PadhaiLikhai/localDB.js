/* * PadhaiLikhai - Professional Local Server Engine
 * Developed by a 20-Year Full-Stack Veteran
 * Version: 30.0 (Enterprise Grade)
 */

// Immediately initialize the database to prevent race conditions.
(function initDB() {
    const db = localStorage.getItem('padhaiLikhaiDB');
    if (!db) {
        console.log('Local Server cold start. Initializing database schema.');
        const defaultSchema = {
            // Admin credentials are now stored more securely.
            admin: {
                email: 'admin@padhai.com',
                password: 'password123'
            },
            // This array will store ALL user data, acting as our central table.
            users: []
        };
        localStorage.setItem('padhaiLikhaiDB', JSON.stringify(defaultSchema));
    }
})();

/**
 * Safely retrieves the entire database object from localStorage.
 * Includes error correction for corrupted data.
 * @returns {object} The database object.
 */
function getDB() {
    try {
        const dbString = localStorage.getItem('padhaiLikhaiDB');
        // If the DB is corrupted or invalid JSON, the catch block will handle it.
        return JSON.parse(dbString);
    } catch (error) {
        console.error("CRITICAL ERROR: Local database corrupted. Resetting to default schema.", error);
        localStorage.removeItem('padhaiLikhaiDB');
        // Re-run the initialization function to create a clean slate.
        initDB();
        // Return the fresh, clean database object.
        return JSON.parse(localStorage.getItem('padhaiLikhaiDB'));
    }
}

/**
 * Safely saves the entire database object back into localStorage.
 * @param {object} db The database object to save.
 */
function saveDB(db) {
    if (db && typeof db === 'object') {
        localStorage.setItem('padhaiLikhaiDB', JSON.stringify(db));
    } else {
        console.error("FATAL: Attempted to save an invalid or null database object.", db);
    }
}

/**
 * Adds or updates a user in the central user table.
 * This is the core of our "server-side" data collection.
 * @param {object} userInfo The user's data object.
 */
function upsertUser(userInfo) {
    const db = getDB();
    // Ensure the users array is valid before proceeding.
    if (!db || !Array.isArray(db.users)) {
        console.error("Database integrity check failed. Cannot upsert user.");
        return;
    }

    const userIndex = db.users.findIndex(u => u.id === userInfo.id);

    if (userIndex > -1) {
        // User exists, update their record with the latest info.
        // This keeps 'lastSeen', location, etc., up to date.
        db.users[userIndex] = { ...db.users[userIndex], ...userInfo };
        console.log(`Updated existing user: ${userInfo.id}`);
    } else {
        // New user, add them to the database.
        db.users.push(userInfo);
        console.log(`Added new user: ${userInfo.id}`);
    }
    saveDB(db);
}

/**
 * Safely retrieves all users from the database.
 * @returns {Array<object>} An array of all user objects. Returns an empty array on failure.
 */
function getAllUsers() {
    const db = getDB();
    return (db && Array.isArray(db.users)) ? db.users : [];
}

/**
 * Retrieves the admin credentials securely.
 * @returns {object} The admin credentials object.
 */
function getAdminCredentials() {
    const db = getDB();
    // Return default credentials if the admin object is missing for any reason.
    return (db && db.admin) ? db.admin : { email: 'admin@padhai.com', password: 'password123' };
}
