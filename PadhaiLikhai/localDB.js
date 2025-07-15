/* * Designed & Developed by Sagar Raj
 * Local Database Helper using localStorage
 * This script manages all data persistence for the application locally.
 */

// This function initializes the local database if it doesn't exist.
const initDB = () => {
    // Check if the database object already exists in localStorage.
    if (!localStorage.getItem('padhaiLikhaiDB')) {
        console.log('No local DB found. Initializing a new one.');
        // If not, create a default structure.
        const defaultDB = {
            // Default admin credentials. In a real-world scenario, this would not be stored client-side.
            admin: {
                email: 'admin@padhai.com',
                password: 'password123'
            },
            // Start with an empty list of users.
            users: []
        };
        // Save the new database structure to localStorage by converting the object to a JSON string.
        localStorage.setItem('padhaiLikhaiDB', JSON.stringify(defaultDB));
    }
};

// This function retrieves the entire database object from localStorage.
const getDB = () => {
    // Parse the JSON string from localStorage back into a JavaScript object.
    return JSON.parse(localStorage.getItem('padhaiLikhaiDB'));
};

// This function saves the provided database object back into localStorage.
const saveDB = (db) => {
    // Convert the JavaScript object into a JSON string before saving.
    localStorage.setItem('padhaiLikhaiDB', JSON.stringify(db));
};

// This function adds a new user to the database.
const addUser = (userInfo) => {
    // Get the current state of the database.
    const db = getDB();
    // Add the new user object to the 'users' array.
    db.users.push(userInfo);
    // Save the updated database.
    saveDB(db);
    console.log('New user added to local DB:', userInfo);
};

// This function retrieves all users from the database.
const getUsers = () => {
    const db = getDB();
    return db.users;
};

// This function retrieves the admin credentials.
const getAdminCredentials = () => {
    const db = getDB();
    return db.admin;
};

// Initialize the database on script load.
initDB();
