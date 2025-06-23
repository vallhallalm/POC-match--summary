const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");

const RPC_URL = "https://spicy-rpc.chiliz.com";

async function main() {
  const folderName = process.argv[2];
  if (!folderName) {
    console.error("❌ Usage: node scripts/callCommitSummary.js <folder>");
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
    "deployment.json"
  );
  const contractPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "MatchSummary",
    "MatchSummary.sol",
    "MatchSummary.json"
  );

  if (!fs.existsSync(walletPath) || !fs.existsSync(deployPath)) {
    console.error("❌ Wallet or deployment data missing");
    process.exit(1);
  }

  const walletJson = JSON.parse(fs.readFileSync(walletPath));
  const deployment = JSON.parse(fs.readFileSync(deployPath));
  const contractJson = JSON.parse(fs.readFileSync(contractPath));

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(walletJson.privateKey, provider);

  const contract = new ethers.Contract(
    deployment.contractAddress,
    contractJson.abi,
    wallet
  );

  const date = Math.floor(Date.now() / 1000);
  const location = "Stade Vélodrome";
  const winner = "0x000000000000000000000000000000000000dEaD";

  console.log("📨 Calling commitSummary...");
  const tx = await contract.commitSummary(date, location, winner);
  console.log("⏳ Tx sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Tx confirmed:", receipt.transactionHash);
}

main().catch(console.error);
