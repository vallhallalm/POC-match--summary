const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");

// ----------------- Config -----------------
const RPC_URL = "https://spicy-rpc.chiliz.com"; // Customize to your RPC
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
  const collectionName = process.argv[3];

  if (!folderName || !collectionName) {
    console.error(
      "❌ Usage: node scripts/deployERC1155.js <folder> <collectionName>"
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
  if (!fs.existsSync(walletPath)) {
    console.error(`❌ Wallet file not found at: ${walletPath}`);
    process.exit(1);
  }

  const walletJson = JSON.parse(fs.readFileSync(walletPath));
  const contractJson = JSON.parse(fs.readFileSync(CONTRACT_PATH));

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(walletJson.privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`📟 Deployer: ${wallet.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} CHZ`);

  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );

  console.log("🚀 Deploying PSGSeason20242025...");
  const contract = await factory.deploy(collectionName, wallet.address);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed at: ${contractAddress}`);

  // Save address
  const deployPath = path.join(
    __dirname,
    "..",
    "addresses",
    folderName,
    "deploymentNft.json"
  );
  fs.writeFileSync(deployPath, JSON.stringify({ contractAddress }, null, 2));
}

main().catch(console.error);
