import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Define the contract ABI
const abi = [
  "event MessageEmitted(string message)",
  "function emitMessage(string calldata _message) external"
];

// Define the contract address
const contractAddress = "0x739136918affCEcfd46aBbc417EC815bB6dbB5dd";

// Define the provider (XRPL EVM endpoint)
const provider = new ethers.JsonRpcProvider("https://rpc-evm-sidechain.xrpl.org");

// Create a contract instance
const contract = new ethers.Contract(contractAddress, abi, provider);

// Function to fetch and print all emitted events
async function fetchAndPrintEvents() {
  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 2000); 
    const events = await contract.queryFilter('MessageEmitted', fromBlock);
    events.forEach((event) => {
      console.log("Event:", event.args.message);
    });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

// Fetch and print all events
fetchAndPrintEvents();