const express = require("express");
const router = express.Router();
const { votingContract } = require("../blockchain");
const { ethers } = require("ethers");

// 1. Check if voting is active
router.get("/votingStatus", async (req, res) => {
  try {
    const status = await votingContract.isVotingActive(); // Matches George's contract
    res.json({ active: status });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

// 2. Get the list of candidates
router.get("/getCandidates", async (req, res) => {
  try {
    const candidates = await votingContract.getAllCandidates();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// 3. The Vote Action (The most important part!)
router.post("/vote", async (req, res) => {
  const { cid, voterHash } = req.body; // cid is the Candidate ID

  try {
    // This tells the Blockchain to record the vote
    const tx = await votingContract.vote(cid, voterHash);
    await tx.wait(); // Wait for the transaction to finish

    res.json({ success: true, message: "Vote cast successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Vote failed. Maybe you already voted?" });
  }
});

module.exports = router;
