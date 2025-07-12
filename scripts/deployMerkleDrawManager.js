const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");

// ----------------- Config -----------------
const RPC_URL = "https://spicy-rpc.chiliz.com"; // Chiliz Spicy Testnet RPC
const CONTRACT_PATH = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "MerkleDrawManager",
  "MerkleDrawManager.sol",
  "MerkleDrawManager.json"
);
// ------------------------------------------

async function main() {
  const folderName = process.argv[2];
  if (!folderName) {
    console.error("❌ Usage: node scripts/deployMerkleDrawManager.js <folder>");
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

  const walletJson = JSON.parse(fs.readFileSync(walletPath));
  const contractJson = JSON.parse(fs.readFileSync(CONTRACT_PATH));
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(walletJson.privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`👛 Deployer address: ${wallet.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} CHZ`);

  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );

  console.log("🚀 Deploying MerkleDrawManager...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ Deployed MerkleDrawManager at: ${address}`);

  const deployPath = path.join(
    __dirname,
    "..",
    "addresses",
    folderName,
    "deploymentMerkleDrawManager.json"
  );
  fs.writeFileSync(
    deployPath,
    JSON.stringify({ contractAddress: address }, null, 2)
  );
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
