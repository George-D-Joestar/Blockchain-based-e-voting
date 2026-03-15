# Admin Portal

The admin portal for the Blockchain-Based E-Voting System. Used by the election administrator to manage candidates and control the voting process.

## Structure
```
Admin Portal/
├── Backend/
│   ├── server.js       — Express server, handles all blockchain interactions
│   ├── abi.json        — Contract ABI
│   ├── .env            — Private key, contract address, RPC URL (not pushed to GitHub)
│   └── package.json
├── Frontend/
│   ├── index.html      — Admin dashboard
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── admin.js
└── start.bat           — Double click to start the backend server
```

## Setup

1. Install dependencies:
```
cd Backend
npm install express ethers@5 dotenv cors
```

2. Fill in the `.env` file:
```
ADMIN_PRIVATE_KEY=0xYourAdminWalletKey
CONTRACT_ADDRESS=0xDeployedContractAddress
RPC_URL=http://26.x.x.x:7545
```

3. Open Ganache and load the project workspace

4. Double click `start.bat` to start the server

5. Open `Frontend/index.html` in a browser

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/addCandidate` | Add a candidate |
| POST | `/removeCandidate` | Deactivate a candidate |
| GET | `/viewCandidate/:cid` | Get candidate details |
| GET | `/getCandidateCount` | Get total candidate count |
| POST | `/startVoting` | Start the election |
| POST | `/endVoting` | End the election |
| GET | `/votingStatus` | Check if voting is active |

## Notes
- Admin wallet (Account 1 from Ganache) must be used as `ADMIN_PRIVATE_KEY`
- Ganache must be running with the correct workspace before starting the server
- All devices must be connected to the Radmin VPN network
- Contract must be deployed before filling in `CONTRACT_ADDRESS`
