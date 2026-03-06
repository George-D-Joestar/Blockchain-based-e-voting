require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ethers = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

// Blockchain connection
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

// Contract setup
const contractAddress = process.env.CONTRACT_ADDRESS;
const abi = require("./abi.json");
const contract = new ethers.Contract(contractAddress, abi, signer);

// Add candidate
app.post("/addCandidate", async (req, res) => {
    try {
        const { name } = req.body;
        const tx = await contract.addCandidate(name);
        await tx.wait();
        res.json({ success: true, message: "Candidate added" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.reason || err.message });
    }
});

// Remove candidate
app.post("/removeCandidate", async (req, res) => {
    try {
        const { cid } = req.body;
        const tx = await contract.removeCandidate(cid);
        await tx.wait();
        res.json({ success: true, message: "Candidate removed" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.reason || err.message });
    }
});

// View candidate
app.get("/viewCandidate/:cid", async (req, res) => {
    try {
        const [name, votes, active] = await contract.viewCandidate(req.params.cid);
        res.json({ name, votes: votes.toString(), active });
    } catch (err) {
        res.status(500).json({ success: false, message: err.reason || err.message });
    }
});

// Get candidate count
app.get("/getCandidateCount", async (req, res) => {
    try {
        const count = await contract.getCandidateCount();
        res.json({ count: count.toString() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.reason || err.message });
    }
});

// Start voting
app.post("/startVoting", async (req, res) => {
    try {
        const tx = await contract.startVoting();
        await tx.wait();
        res.json({ success: true, message: "Voting started" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.reason || err.message });
    }
});

// End voting
app.post("/endVoting", async (req, res) => {
    try {
        const tx = await contract.endVoting();
        await tx.wait();
        res.json({ success: true, message: "Voting ended" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.reason || err.message });
    }
});

// Check voting status
app.get("/votingStatus", async (req, res) => {
    try {
        const active = await contract.votingactive();
        res.json({ active });
    } catch (err) {
        res.status(500).json({ success: false, message: err.reason || err.message });
    }
});

// Test route
app.get("/", (req, res) => {
    res.send("Admin backend is running");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});