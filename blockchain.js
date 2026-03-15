const { ethers } = require("ethers");
require("dotenv").config();
const abi = require("./abi.json");

// Connect to George's Radmin VPN IP
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// Use the private key for this specific machine
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// The Contract Connection
const votingContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet,
);

module.exports = { votingContract, provider, wallet };
