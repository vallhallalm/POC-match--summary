const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const [, , folderName, recipientAddress, amountStr] = process.argv;
if (!folderName || !recipientAddress || !amountStr) {
  console.error(
    "Usage: node scripts/transferChz.js <folderName> <recipientAddress> <amountInCHZ>"
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

const amount = ethers.parseEther(amountStr); // same as parseUnits(amountStr, 18)

async function transferCHZ() {
  console.log(`Transferring ${amountStr} CHZ to ${recipientAddress}...`);

  const tx = await wallet.sendTransaction({
    to: recipientAddress,
    value: amount,
  });

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log(`Transfer complete. Tx hash: ${tx.hash}`);
}

transferCHZ().catch((err) => {
  console.error("Transfer failed:", err);
});
