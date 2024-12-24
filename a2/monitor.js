const { ethers } = require("ethers");
const XRPL_EVM_RPC_URL = "https://rpc-evm-sidechain.xrpl.org"; // Replace with your XRPL EVM Sidechain RPC URL
const AXELAR_AMPLIFIER_GATEWAY_ADDRESS = "0x48CF6E93C4C1b014F719Db2aeF049AA86A255fE2"; // Replace with the Axelar Amplifier Gateway contract address
const ABI = [
  // ABI for the ContractCallApproved event
  "event ContractCallApproved(bytes32 indexed commandId, string sourceChain, string sourceAddress, bytes payload)"
];

const provider = new ethers.providers.JsonRpcProvider(XRPL_EVM_RPC_URL);
const contract = new ethers.Contract(AXELAR_AMPLIFIER_GATEWAY_ADDRESS, ABI, provider);

contract.on("ContractCallApproved", (commandId, sourceChain, sourceAddress, payload) => {
  console.log("ContractCallApproved event detected:");
  console.log("commandId:", commandId);
  console.log("sourceChain:", sourceChain);
  console.log("sourceAddress:", sourceAddress);
  console.log("payload:", payload);
});