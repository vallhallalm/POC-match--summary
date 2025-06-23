const { Wallet } = require("ethers");
const fs = require("fs-extra");
const path = require("path");

// Read argument (e.g., node generateWallet.js MyTeam)
const label = process.argv[2];

if (!label) {
  console.error("❌ Please provide a folder name (e.g., MyTeam)");
  process.exit(1);
}

// Generate new wallet
const wallet = Wallet.createRandom();

// Create the output folder
const folderPath = path.join(__dirname, "../addresses", label);
fs.ensureDirSync(folderPath);

// Save wallet details
const walletData = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic.phrase,
};

fs.writeFileSync(
  path.join(folderPath, "wallet.json"),
  JSON.stringify(walletData, null, 2)
);

console.log(
  `✅ Wallet created and saved under: addresses/${label}/wallet.json`
);
console.log("Address:", wallet.address);
