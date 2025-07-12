const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");

// ----------------- Config -----------------
const RPC_URL = "https://spicy-rpc.chiliz.com"; // Or another RPC endpoint
const CONTRACT_PATH = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "MatchSummary2",
  "MatchSummary2.sol",
  "MatchSummary2.json"
);
// ------------------------------------------

async function main() {
  const folderName = process.argv[2];
  if (!folderName) {
    console.error("❌ Usage: node scripts/deployMatchSummary2.js <folder>");
    process.exit(1);
  }

  const walletPath = path.join(
    __dirname,
    "..",
    "addresses",
    folderName,
    "wallet.json"
  );
  if (!fs.existsSync(walletPath)) {
    console.error(`❌ Wallet file not found at: ${walletPath}`);
    process.exit(1);
  }

  const contractJson = JSON.parse(fs.readFileSync(CONTRACT_PATH));
  const walletJson = JSON.parse(fs.readFileSync(walletPath));
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  console.log(walletJson.privateKey);
  const wallet = new ethers.Wallet(walletJson.privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance before deploy: ${ethers.formatEther(balance)} CHZ`);

  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );
  console.log("⏳ Deploying MatchSummary2...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ Deployed at: ${address}`);
  const deployPath = path.join(
    __dirname,
    "..",
    "addresses",
    folderName,
    "deploymentMatchSummary2.json"
  );
  fs.writeFileSync(
    deployPath,
    JSON.stringify({ contractAddress: address }, null, 2)
  );
}

main().catch(console.error);
