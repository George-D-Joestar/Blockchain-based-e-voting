const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// --- THE LOGIN ROUTE (Module C) ---
app.post('/api/login', (req, res) => {
    const { student_id, password } = req.body;

    // 1. Look for the student in the database
    const sql = "SELECT * FROM users WHERE student_id = ?";
    db.query(sql, [student_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            const user = results[0];
            // 2. Simple password check (Aiswarya will add 'bcrypt' hashing later for security)
            if (password === user.password_hash) {
                res.json({ message: "Login Successful!", hasVoted: user.has_voted });
            } else {
                res.status(401).json({ message: "Wrong password!" });
            }
        } else {
            res.status(404).json({ message: "Student ID not found!" });
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
