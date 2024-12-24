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

// Define the signer (using private key)
const privateKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);

// Create a contract instance
const contract = new ethers.Contract(contractAddress, abi, signer);

// Function to call the emitMessage function on the contract
async function callEmitMessage(message) {
  try {
    const tx = await contract.emitMessage(message);
    console.log("Transaction response:", tx);
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error calling emitMessage:", error);
  }
}

// Call the function with a message
callEmitMessage("Hello, XRPL EVM!");