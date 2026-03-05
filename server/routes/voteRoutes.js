const express = require("express");
const router = express.Router();
const { votingContract } = require("../blockchain");
const { generateVoterHash } = require("../utils/voterUtils");

// Local cache to prevent race conditions (double clicks)
const pendingVotes = new Map();

// 1. Check Voting Status
router.get("/votingStatus", async (req, res) => {
  try {
    const isActive = await votingContract.votingActive();
    res.json({ active: isActive });
  } catch (err) {
    res.status(500).json({ error: "Blockchain connection offline" });
  }
});

// 2. List Candidates
router.get("/getCandidates", async (req, res) => {
  try {
    const count = await votingContract.candidateCount();
    const candidates = [];
    for (let i = 1; i <= count; i++) {
      const data = await votingContract.viewCandidate(i);
      // data format: [name, voteCount, exists]
      if (data[2]) {
        candidates.push({ id: i, name: data[0], votes: data[1].toString() });
      }
    }
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// 3. The Secured Vote Route
router.post("/vote", async (req, res) => {
  const { cid, email } = req.body;

  if (!cid || !email) {
    return res.status(400).json({ error: "Missing Candidate ID or Email" });
  }

  const voterHash = generateVoterHash(email);

  // FIX: Check if this voter is already in our local "Processing" queue
  if (pendingVotes.has(voterHash)) {
    return res
      .status(429)
      .json({ error: "Your vote is already being processed. Please wait." });
  }

  try {
    // Double check blockchain state before sending transaction
    const hasAlreadyVoted = await votingContract.voted(voterHash);
    if (hasAlreadyVoted) {
      return res
        .status(400)
        .json({ error: "Blockchain records show you have already voted." });
    }

    // Add to local queue to prevent race conditions
    pendingVotes.set(voterHash, true);

    // Send Transaction with manual Nonce management
    const tx = await votingContract.vote(cid, voterHash);

    console.log(`Vote transaction sent: ${tx.hash}`);

    // Wait for 1 confirmation on George's Ganache
    const receipt = await tx.wait();

    // Remove from local queue after success
    pendingVotes.delete(voterHash);

    res.json({
      success: true,
      message: "Vote cast successfully!",
      txHash: receipt.transactionHash,
    });
  } catch (err) {
    pendingVotes.delete(voterHash); // Clear queue on error

    // Better Error Handling: Check if it's a smart contract 'require' failure
    const errorMessage = err.reason || err.message || "Transaction failed";
    console.error("Voting Error:", errorMessage);

    res.status(400).json({
      error: "Voting failed",
      details: errorMessage,
    });
  }
});

module.exports = router;
