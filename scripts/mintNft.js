const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");

// ----------------- Config -----------------
const RPC_URL = "https://spicy-rpc.chiliz.com"; // Replace if needed
const CONTRACT_PATH = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "PSGSeason2024-2025",
  "PSGSeason2024-2025.sol",
  "PSGSeason20242025.json"
);
// ------------------------------------------

async function main() {
  const folderName = process.argv[2]; // address folder
  const toAddress = process.argv[3]; // recipient
  const tokenId = parseInt(process.argv[4]); // tokenId
  const amount = parseInt(process.argv[5]); // amount

  if (!folderName || !toAddress || isNaN(tokenId) || isNaN(amount)) {
    console.error(
      "❌ Usage: node scripts/mintToken.js <folder> <to> <tokenId> <amount>"
    );
    process.exit(1);
  }

  // Load wallet & contract
  const walletPath = path.join(
    __dirname,
    "..",
    "addresses",
    folderName,
    "wallet.json"
  );
  const deployPath = path.join(
    __dirname,
    "..",
    "addresses",
    folderName,
    "deploymentNft.json"
  );

  if (!fs.existsSync(walletPath) || !fs.existsSync(deployPath)) {
    console.error("❌ Missing wallet or deployment file.");
    process.exit(1);
  }

  const walletJson = JSON.parse(fs.readFileSync(walletPath));
  const deploymentJson = JSON.parse(fs.readFileSync(deployPath));
  const contractJson = JSON.parse(fs.readFileSync(CONTRACT_PATH));

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(walletJson.privateKey, provider);

  const contract = new ethers.Contract(
    deploymentJson.contractAddress,
    contractJson.abi,
    wallet
  );

  console.log(`⏳ Minting ${amount} of token ID ${tokenId} to ${toAddress}...`);
  const tx = await contract.mint(toAddress, tokenId, amount, "0x");
  await tx.wait();
  console.log(`✅ Minted! TX Hash: ${tx.hash}`);
}

main().catch(console.error);
