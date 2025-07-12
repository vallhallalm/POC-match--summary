const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");

// ----------------- Config -----------------
const RPC_URL = "https://spicy-rpc.chiliz.com"; // Your network RPC
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
  const folderName = process.argv[2];
  const tokenId = parseInt(process.argv[3]);
  const uri = process.argv[4]; // full IPFS URI or HTTP URI

  if (!folderName || isNaN(tokenId) || !uri) {
    console.error(
      "❌ Usage: node scripts/setTokenURI.js <folder> <tokenId> <uri>"
    );
    process.exit(1);
  }

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
    console.error("❌ Wallet or contract deployment file missing.");
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

  console.log(`⏳ Setting URI for token ${tokenId} to ${uri}...`);
  const tx = await contract.setTokenURI(tokenId, uri);
  await tx.wait();

  console.log(`✅ Token URI set! TX Hash: ${tx.hash}`);
}

main().catch(console.error);
