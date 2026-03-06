const express = require('express');
const cors = require('cors');
const db = require('./db.js'); 
const { ethers } = require('ethers'); 
const abi = require('./abi.json'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. BLOCKCHAIN SETUP (PAUSED) ---
// We keep these commented out so the server doesn't crash while George is away
// const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
// const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
// const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// --- 2. MYSQL LOGIN ROUTE ---
app.post('/api/login', (req, res) => {
    const { student_id, password } = req.body;
    const sql = "SELECT * FROM users WHERE student_id = ?";
    db.query(sql, [student_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0 && password === results[0].password_hash) {
            res.json({ message: "Login Successful!", email: results[0].email });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

// --- 3. STATUS ROUTE ---
app.get('/', (req, res) => {
    res.send("Backend Server is Live and Running!");
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n*****************************************`);
    console.log(`✅ SUCCESS: Server is running on Port ${PORT}`);
    console.log(`*****************************************\n`);
});