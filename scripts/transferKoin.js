const fs = require("fs");
const path = require("path");
const ethers = require("ethers");

const [, , folderName, recipientAddress, amountStr] = process.argv;
if (!folderName || !recipientAddress || !amountStr) {
  console.error(
    "Usage: node scripts/transferKoin.js <folderName> <recipient> <amount>"
  );
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

const deploymentPath = path.join("addresses", folderName, "deployment.json");
const { Koin: contractAddress } = JSON.parse(fs.readFileSync(deploymentPath));

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
const contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);

const amount = ethers.parseUnits(amountStr, 18);

async function transfer() {
  console.log(`Transferring ${amountStr} KOIN to ${recipientAddress}...`);

  const tx = await contract.transfer(recipientAddress, amount);
  console.log("Waiting for tx confirmation...");
  await tx.wait();

  console.log(`Transfer successful! Tx hash: ${tx.hash}`);
}

transfer().catch((err) => {
  console.error("Transfer failed:", err);
});
