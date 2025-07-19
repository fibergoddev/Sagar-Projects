// PadhaiLikhai - Backend Server by Sagar Raj
// This server handles user data collection and provides a secure admin dashboard.

const express = require('express');
const { Low, JSONFile } = require('lowdb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 3000;

// --- Database Setup ---
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initializeDatabase() {
    await db.read();
    db.data = db.data || { users: [], admin: {} };
    
    // Create a default admin if one doesn't exist
    if (!db.data.admin.username) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt); // Default password
        db.data.admin = {
            username: 'admin',
            password: hashedPassword
        };
        await db.write();
        console.log('Default admin created. User: admin, Pass: admin123');
    }
}

// --- Middleware ---
app.use(cors()); // Allow cross-origin requests from your frontend
app.use(express.json()); // To parse JSON bodies
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the parent directory

// --- API Routes ---

// Endpoint to track user data
app.post('/api/track', async (req, res) => {
    try {
        const { userData } = req.body;
        if (!userData || !userData.id) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        await db.read();
        const users = db.data.users;
        const existingUserIndex = users.findIndex(u => u.id === userData.id);

        const fullUserData = {
            ...userData,
            lastVisited: new Date().toISOString(),
            ipAddress: req.ip // Express captures the IP address
        };

        if (existingUserIndex > -1) {
            // Update existing user
            users[existingUserIndex] = { ...users[existingUserIndex], ...fullUserData };
        } else {
            // Add new user
            users.push(fullUserData);
        }

        await db.write();
        res.status(200).json({ message: 'User data tracked successfully.' });

    } catch (error) {
        console.error('Error tracking user data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint for admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        await db.read();
        const admin = db.data.admin;

        if (username === admin.username && await bcrypt.compare(password, admin.password)) {
            // In a real app, you'd issue a JWT token here for session management
            res.status(200).json({ success: true, message: 'Login successful.' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to get all user data (for admin)
app.get('/api/admin/users', async (req, res) => {
    // In a real app, this should be protected by authentication middleware (e.g., checking for a valid JWT)
    await db.read();
    res.status(200).json(db.data.users);
});


// --- Server Initialization ---
app.listen(port, async () => {
    await initializeDatabase();
    console.log(`PadhaiLikhai server listening at http://localhost:${port}`);
    console.log('Serving static files from:', path.join(__dirname, '..'));
});
