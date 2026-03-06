# Blockchain E-Voting System – Architecture Brief

## Overview
A blockchain-based voting system built on a private Ethereum network (Ganache) using Solidity smart contracts, with a Node.js/Express backend and separate frontends for admin and voting.

---

## Network
All devices communicate over a **Radmin VPN** network. Radmin assigns each device a fixed virtual IP (e.g. `26.x.x.x`) that does not change regardless of which WiFi network the host is on. All API calls and blockchain RPC connections use this Radmin IP.

- **Host machine (Admin PC):** Runs Ganache, the admin backend, and serves the admin frontend
- **Voting machines:** Run their own lightweight backend and connect to Ganache on the admin PC over Radmin

---

## Blockchain
- **Platform:** Ganache (private Ethereum network) with a saved workspace for state persistence
- **Smart contract:** `Voting.sol` (Solidity), deployed once and kept alive via the Ganache workspace
- **Contract address and ABI** are shared across all backends via `.env` and `abi.json`

---

## Wallet Architecture
Each device is an **independent blockchain participant** with its own Ethereum wallet:

| Device | Wallet | Permissions |
|---|---|---|
| Admin PC | Account 1 | addCandidate, removeCandidate, startVoting, endVoting |
| Voting Machine 1 | Account 2 | vote() only |
| Voting Machine 2 | Account 3 | vote() only |

Wallets are taken from Ganache's pre-funded accounts. Each machine's private key is stored in its own `.env` file and never exposed to the frontend.

---

## Voter Identity
Voter details (name, email, password, TOTP secret) are stored **off-chain** in a database handled by the Votereg system.

On-chain, each voter is identified by a **keccak256 hash of their email**, generated as follows:

```javascript
const voterHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));
```

This hash is passed to the `vote()` function and stored on the blockchain to prevent double voting. No personal information is stored on-chain.

---

## System Components

### 1. Smart Contract (Admin PC)
- Deployed on Ganache
- Manages candidates, voting state, and vote recording
- Key functions: `addCandidate()`, `removeCandidate()`, `startVoting()`, `endVoting()`, `vote()`, `hasVoted()`, `viewCandidate()`, `getCandidateCount()`, `votingactive()`

### 2. Admin Backend (Admin PC)
- Express server running on port `3000`
- Uses **Account 1** (admin wallet) as signer
- Exposes routes: `/addCandidate`, `/removeCandidate`, `/startVoting`, `/endVoting`, `/votingStatus`, `/viewCandidate/:cid`, `/getCandidateCount`

### 3. Voting Machine Backend (Each Voting Machine)
- Lightweight Express server
- Uses its **own unique wallet** as signer (Account 2 or Account 3)
- Exposes routes: `/vote`, `/hasVoted/:voterHash`, `/votingStatus`, `/getCandidates`
- `.env` contains unique `PRIVATE_KEY` per machine, same `CONTRACT_ADDRESS` and `RPC_URL`

### 4. Frontends
- **Admin frontend:** Served from admin PC, used to manage candidates and control voting
- **Voting frontend (React):** Connects to the voting machine's own backend at `http://26.x.x.x:<port>`

---

## Voting Flow
```
1. Voter authenticates via Votereg (email + password + TOTP)
2. Frontend generates voterHash = keccak256(email)
3. Call GET /hasVoted/:voterHash → block if already voted
4. Call GET /getCandidates → display active candidates
5. Voter selects candidate
6. Call POST /vote with { cid, voterHash }
7. Voting machine backend signs and submits transaction to Ganache
8. Contract records vote and marks voterHash as used
```

---

## Environment Variables (per machine)
```
PRIVATE_KEY=0xUniquePerMachine
CONTRACT_ADDRESS=0xSameForAll
RPC_URL=http://26.x.x.x:7545
```

---

## Key Coordination Points
- The `voterHash` must be generated using `keccak256(email)` consistently across Votereg and the voting frontend
- `CONTRACT_ADDRESS` and `abi.json` must be the same across all backends
- Ganache must be running on the admin PC with the correct workspace open before any backend is started
- All machines must be connected to the Radmin VPN network before testing
