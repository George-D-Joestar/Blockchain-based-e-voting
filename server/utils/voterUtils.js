const { ethers } = require("ethers");

const generateVoterHash = (email) => {
  try {
    // Matches George's requirement: keccak256(utf8(email))
    return ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(email.toLowerCase().trim()),
    );
  } catch (error) {
    return null;
  }
};

module.exports = { generateVoterHash };
