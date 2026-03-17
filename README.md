# Blockchain-Based E-Voting System

A decentralized electronic voting system built on a private Ethereum blockchain. Designed for institutional elections with a focus on transparency, security, and voter privacy.

---

## Overview

This system uses a Solidity smart contract deployed on a private Ganache blockchain to record votes immutably. Voter identity is verified off-chain through a registration and authentication system, while votes are recorded on-chain using a hashed voter identity — ensuring privacy without sacrificing auditability.

---

## Repository Structure

```
Blockchain-based-e-voting/
├── Blockchain/              — Solidity smart contract + Hardhat environment
├── Admin Portal/            — Admin backend (Express) + Admin frontend
├── Voting Portal/           — Voting machine backend (Express) + Voting frontend (React)
└── Votereg/                 — Voter registration and authentication system
```

---

## System Architecture

```
                        Ganache (Private Blockchain)
                                   ▲
                    ───────────────┼───────────────
                    │                             │
            Admin Backend                 Voting Machine Backend
            (Account 1)                  (Account 2 / Account 3)
                    │                             │
            Admin Frontend                Voting Frontend (React)
```

All devices communicate over a **Radmin VPN** network using fixed virtual IPs, making the setup WiFi-independent.

---

## Blockchain

- **Platform:** Ganache (private Ethereum network) with workspace persistence
- **Language:** Solidity
- **Environment:** Hardhat
- **Key contract functions:**

| Function | Description |
|---|---|
| `addCandidate(name)` | Add a candidate (admin only) |
| `removeCandidate(cid)` | Deactivate a candidate (admin only) |
| `startVoting()` | Open the election (admin only) |
| `endVoting()` | Close the election (admin only) |
| `vote(cid, voterHash)` | Cast a vote |
| `hasVoted(voterHash)` | Check if a voter has already voted |
| `viewCandidate(cid)` | Get candidate details |
| `getCandidateCount()` | Get total number of candidates |
| `votingactive()` | Check if voting is currently active |

---

## Wallet Architecture

Each device is an independent blockchain participant with its own Ethereum wallet:

| Device | Ganache Account | Permissions |
|---|---|---|
| Admin PC | Account 1 | addCandidate, removeCandidate, startVoting, endVoting |
| Voting Machine 1 | Account 2 | vote() only |
| Voting Machine 2 | Account 3 | vote() only |

Private keys are stored in `.env` files on each machine and are never exposed to the frontend.

---

## Voter Identity & Privacy

No personal data is stored on-chain. Each voter is identified by a **keccak256 hash of their email address**:

```javascript
const voterHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));
```

This hash is passed to the `vote()` function and stored on the blockchain to prevent double voting. The original email cannot be recovered from the hash.

---

## Network Setup

- All devices must be connected to the same **Radmin VPN** network
- Ganache listens on `0.0.0.0` to accept connections from all devices on the network
- All backends point to the admin PC's Radmin virtual IP for the blockchain RPC URL

### Environment Variables (per machine)

```
PRIVATE_KEY=0xUniquePerMachine
CONTRACT_ADDRESS=0xSameForAll
RPC_URL=http://26.x.x.x:7545
API_KEY=SharedSecretKey
```

---

## Components

### Blockchain (Hardhat Project)
- Contains `Voting.sol` and deployment scripts
- Run `npx hardhat compile` to compile
- Run `npx hardhat run scripts/deploy.js --network ganache` to deploy (once only)

### Admin Portal
- Express backend + plain HTML/CSS/JS frontend
- Manages candidates and controls election state
- See `Admin Portal/README.md` for setup details

### Voting Portal
- Express backend + React frontend
- Handles voter authentication and vote submission
- Each voting machine runs its own backend instance with a unique wallet
- See `Voting Portal/README.md` for setup details

### Votereg
- Handles voter registration, login, and OTP verification
- Stores voter details off-chain in a database
- Communicates voter identity to the voting portal via hashed email

---

## Getting Started

### Prerequisites
- Node.js v18+
- Ganache (with saved workspace)
- Radmin VPN (all devices on same network)
- npm

### Startup Order
1. Open Ganache and load the project workspace
2. Start the Admin backend (`start.bat` or `node server.js`)
3. Start the Voting Machine backend on each voting device
4. Open the Admin frontend in a browser
5. Voters access the Voting frontend on their assigned machine

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity |
| Blockchain Environment | Hardhat + Ganache |
| Backend | Node.js + Express |
| Blockchain Interaction | ethers.js v5 |
| Admin Frontend | HTML, CSS, JavaScript |
| Voting Frontend | React |
| Network | Radmin VPN |

---

## Security

- Private keys are stored only in `.env` files, never in frontend code
- All API routes are protected with an `x-api-key` header
- Voter privacy is maintained through keccak256 hashing of identity
- Double voting is prevented both on-chain (voterHash check) and off-chain (pending votes queue)
- `.env` files and `node_modules` are excluded from the repository via `.gitignore`
