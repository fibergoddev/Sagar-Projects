/* * Designed & Developed by Sagar Raj
 * Local Database Helper using localStorage - ROBUST VERSION
 * This script is built to be fail-safe and handles all data persistence.
 */

// This function initializes the local database if it doesn't exist.
const initDB = () => {
    // Check if the database object already exists in localStorage.
    if (!localStorage.getItem('padhaiLikhaiDB')) {
        console.log('No local DB found. Initializing a new one.');
        // If not, create a default structure.
        const defaultDB = {
            admin: {
                email: 'admin@padhai.com',
                password: 'password123'
            },
            users: []
        };
        // Save the new database structure to localStorage.
        localStorage.setItem('padhaiLikhaiDB', JSON.stringify(defaultDB));
    }
};

// This function safely retrieves the entire database object from localStorage.
const getDB = () => {
    try {
        const dbString = localStorage.getItem('padhaiLikhaiDB');
        // If the DB string is null, undefined, or invalid, it will fall to the catch block.
        return JSON.parse(dbString);
    } catch (error) {
        console.error("Error parsing local DB. Resetting to default.", error);
        // If parsing fails (e.g., corrupted data), clear the bad data and re-initialize.
        localStorage.removeItem('padhaiLikhaiDB');
        initDB();
        // Return the newly initialized DB.
        return JSON.parse(localStorage.getItem('padhaiLikhaiDB'));
    }
};

// This function saves the provided database object back into localStorage.
const saveDB = (db) => {
    // Ensure db is a valid object before trying to stringify.
    if (db && typeof db === 'object') {
        localStorage.setItem('padhaiLikhaiDB', JSON.stringify(db));
    } else {
        console.error("Attempted to save an invalid DB object:", db);
    }
};

// This function adds a new user to the database.
const addUser = (userInfo) => {
    const db = getDB();
    // Ensure the users array exists before pushing to it.
    if (db && Array.isArray(db.users)) {
        db.users.push(userInfo);
        saveDB(db);
        console.log('New user added to local DB:', userInfo);
    }
};

// This function safely retrieves all users from the database.
const getUsers = () => {
    const db = getDB();
    // CRITICAL FIX: Always return an array, even if the DB is corrupt or users are missing.
    return (db && Array.isArray(db.users)) ? db.users : [];
};

// This function retrieves the admin credentials.
const getAdminCredentials = () => {
    const db = getDB();
    // Provide default credentials if the admin object is missing for any reason.
    return (db && db.admin) ? db.admin : { email: '', password: '' };
};

// Initialize the database on script load.
initDB();
