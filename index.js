const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
// Make sure these credentials match your XAMPP phpMyAdmin settings
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'voting_system' // Change this to your actual database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// --- PORTAL 1: REGISTRATION ---
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Check if the email belongs to the college domain
    if (!email.endsWith('@mgits.ac.in')) {
        return res.status(400).json({ message: 'Only @mgits.ac.in emails are allowed.' });
    }

    const query = "INSERT INTO users (email, password, has_voted) VALUES (?, ?, 0)";
    db.query(query, [email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'User already exists.' });
            }
            return res.status(500).json({ error: err });
        }
        res.status(201).json({ message: 'User registered successfully!' });
    });
});

// --- PORTAL 2: VOTING LOGIN ---
// Checks if credentials are correct AND if the user has already voted
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        if (results.length > 0) {
            const user = results[0];
            
            // Check the voting status column
            if (user.has_voted === 1) {
                return res.status(403).json({ message: "Access Denied: You have already cast your vote." });
            }

            res.status(200).json({ 
                message: "Login successful. Welcome to the Voting Portal.", 
                user: { email: user.email } 
            });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    });
});

// --- INTEGRATION ROUTE: MARK AS VOTED ---
// This will be called after the Blockchain transaction is successful
app.post('/mark-voted', (req, res) => {
    const { email } = req.body;
    const query = "UPDATE users SET has_voted = 1 WHERE email = ?";
    
    db.query(query, [email], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to update voting status." });
        res.status(200).json({ message: "Voter status updated successfully in MySQL." });
    });
});

// --- SERVER START ---
// Using 5000 as the port. Use your Radmin IP here for Amrin to connect.
const PORT = 5000;
const MY_IP = '26.15.111.159'; // Your Radmin IP as a string

app.listen(PORT, MY_IP, () => {
    console.log(`Backend Server running at http://${MY_IP}:${PORT}`);
});