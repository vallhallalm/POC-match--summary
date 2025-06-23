const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = "https://spicy-rpc.chiliz.com"; // Chilliz spicy testnet RPC
const txHash =
  "0x38de6d510f77858183726a97de9123c5ae6caa16807b335ddd8f2c071e57b046"; // Replace with your existing transaction hash

// Load your contract ABI JSON (adjust path)
const abiPath = path.join(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "MatchSummary",
  "MatchSummary.sol",
  "MatchSummary.json"
);
const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const abi = contractJson.abi;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Get transaction receipt by txHash
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    console.error("Transaction receipt not found or transaction not mined yet");
    return;
  }

  console.log("Transaction receipt found. Parsing logs...");

  const iface = new ethers.Interface(abi);

  for (const log of receipt.logs) {
    try {
      const parsedLog = iface.parseLog(log);
      console.log("Event:", parsedLog.name);
      console.log("Args:", parsedLog.args);
      // If you want to convert date from BigNumber to number
      if (parsedLog.args.date) {
        console.log(" - date (number):", parsedLog.args.date.toNumber());
      }
    } catch (e) {
      // Log not from this contract, ignore
    }
  }
}

main().catch(console.error);
