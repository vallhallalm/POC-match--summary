const fs = require("fs");
const path = require("path");
const ethers = require("ethers");

const folderName = process.argv[2];
if (!folderName) {
  console.error("Usage: node scripts/deployKoin.js <folderName>");
  process.exit(1);
}

const keyPath = path.join(
  __dirname,
  "..",
  "addresses",
  folderName,
  "wallet.json"
);
if (!fs.existsSync(keyPath)) {
  console.error(`Wallet file not found at: ${keyPath}`);
  process.exit(1);
}
const privateKey = JSON.parse(fs.readFileSync(keyPath, "utf-8")).privateKey;

const provider = new ethers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
const wallet = new ethers.Wallet(privateKey, provider);

const CONTRACT_PATH = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "Koin",
  "Koin.sol",
  "Koin.json"
);
const contractJson = JSON.parse(fs.readFileSync(CONTRACT_PATH));
const factory = new ethers.ContractFactory(
  contractJson.abi,
  contractJson.bytecode,
  wallet
);

// 🪙 Initial token supply (e.g. 10000 KOIN with 18 decimals)
const initialSupply = ethers.parseUnits("10000", 18);

async function deploy() {
  console.log(`Deploying Koin from: ${wallet.address}...`);

  const contract = await factory.deploy(initialSupply, wallet.address);
  console.log("Waiting for deployment...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`Koin deployed at: ${address}`);

  // Save deployment address
  const deployPath = path.join("addresses", folderName, "deployment.json");
  const deployData = { Koin: address };
  fs.writeFileSync(deployPath, JSON.stringify(deployData, null, 2));
  console.log(`Saved to ${deployPath}`);
}

deploy().catch((err) => {
  console.error("Deployment failed:", err);
});
