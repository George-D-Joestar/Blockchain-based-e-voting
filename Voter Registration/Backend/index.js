const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors()); // This allows Amrin's laptop to talk to yours!

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'voting_system' // Make sure this matches your name in phpMyAdmin
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL Database (Sara's Backend).');
});

// --- CONNECTION TEST ROUTE ---
// When Amrin types http://26.15.111.159:5000 in Chrome, she will see this!
app.get('/', (req, res) => {
    res.send("<h1>Backend Server is LIVE!</h1><p>Ready for Registration and Voting.</p>");
});

// --- PORTAL 1: VOTER REGISTRATION ---
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    console.log(`📝 Registration request for: ${email}`);

    if (!email.endsWith('@mgits.ac.in')) {
        return res.status(400).json({ message: 'Only @mgits.ac.in emails are allowed.' });
    }

    const query = "INSERT INTO users (email, password, has_voted) VALUES (?, ?, 0)";
    db.query(query, [email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'User already exists.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User registered successfully!' });
    });
});

// --- PORTAL 2: VOTING LOGIN ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        if (results.length > 0) {
            const user = results[0];
            
            // SECURITY CHECK: If user already voted, block them here!
            if (user.has_voted === 1) {
                console.log(`⛔ Access Denied: ${email} has already voted.`);
                return res.status(403).json({ message: "Access Denied: You have already cast your vote." });
            }

            console.log(`🔓 Login Successful: ${email}`);
            res.status(200).json({ 
                message: "Login successful. Welcome to the Voting Portal.", 
                user: { email: user.email } 
            });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    });
});

// --- INTEGRATION ROUTE: MARK AS VOTED (The "Security Lock") ---
app.post('/mark-voted', (req, res) => {
    const { email } = req.body;
    console.log(`🔒 LOCKING USER: ${email} has cast their vote.`);

    const query = "UPDATE users SET has_voted = 1 WHERE email = ?";
    
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ error: "Failed to update voting status." });
        }
        res.status(200).json({ message: "Voter status updated successfully in MySQL." });
    });
});

// --- SERVER START ---
const PORT = 5000;
const MY_IP = '26.15.111.159'; // Your Radmin IP

app.listen(PORT, MY_IP, () => {
    console.log(`🚀 Sara's Backend Server running at http://${MY_IP}:${PORT}`);
});         console.error("Update Error:", err);
            return res.status(500).json({ error: "Failed to update voting status." });
        }
        res.status(200).json({ message: "Voter status updated successfully in MySQL." });
    });
});

// --- SERVER START ---
const PORT = 5000;
const MY_IP = '26.15.111.159'; // Your Radmin IP

app.listen(PORT, MY_IP, () => {
    console.log(`🚀 Sara's Backend Server running at http://${MY_IP}:${PORT}`);
 
