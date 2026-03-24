const { ethers } = require("ethers");
require("dotenv").config();

// 1. Setup Provider (Connects to Ganache)
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// 2. Fetch Private Key safely
const privateKey = process.env.PRIVATE_KEY;

// Safety Check: If the key is missing, don't crash the whole app
if (!privateKey || privateKey === "0x") {
  console.error("❌ ERROR: PRIVATE_KEY is missing in your .env file!");
  console.log("💡 Tip: Copy a private key from Ganache and paste it into .env");
}

// 3. Create Wallet instance
let wallet;
try {
  wallet = new ethers.Wallet(privateKey, provider);
  console.log("✅ Blockchain Wallet initialized:", wallet.address);
} catch (error) {
  console.error("❌ Failed to initialize wallet:", error.message);
}

// 4. Load Smart Contract ABI
// Make sure you have the 'Voting.json' file in your folder!
const contractJson = require("./Voting.json");
const contractAddress = process.env.CONTRACT_ADDRESS;

const votingContract = new ethers.Contract(
  contractAddress,
  contractJson.abi,
  wallet,
);

module.exports = { votingContract, provider, wallet };
