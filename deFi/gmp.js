import { ethers } from "ethers";
import dotenv from "dotenv";
import * as utils from "./utils.js"
import * as p2pUtils from "./p2pPayloadUtil.js"
dotenv.config();

// Define the provider (XRPL EVM endpoint)
const provider = new ethers.JsonRpcProvider("https://rpc-evm-sidechain.xrpl.org");

// Define the signer (using private key)
const privateKey = process.env.PRIVATE_KEY;
const authModule = process.env.PUBLIC_ADDRESS;
const signer = new ethers.Wallet(privateKey, provider);

// Function to call the emitMessage function on the contract
async function approveContractCall(input) {
  const gatewayAbi = [
    "function execute(bytes calldata input) external"
  ];
  const gatewayAddress = process.env.MY_GATEWAY_ADDRESS;
  const gatewayContract = new ethers.Contract(gatewayAddress,  gatewayAbi, signer);
  try {
    const tx = await gatewayContract.execute(input);
    console.log("Transaction response:", tx);
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error calling execute:", error);
  }
}

async function callPocContract(params) {
  await callContract(params, process.env.GMS_EXECUTABLE_ADDRESS);
}

async function callP2PCallContract(params) {
  console.log("Calling P2P Contract with address:", process.env.XRP_LENDING_P2P);
  await callContract(params, process.env.XRP_LENDING_P2P);
}

async function callContract(params, contract_address) {
  const gmsExecutableAbi = [
    "error DecodingError(string reason)",
    "error AmountCheckFailed(uint256 amount)",
    "error SendTokenFailed(string reason)",
    "function executeWithToken(bytes32 commandId,string calldata sourceChain,string calldata sourceAddress,bytes calldata payload,string calldata tokenSymbol,uint256 amount) external"
  ];
  const gmsExecutableContract = new ethers.Contract(contract_address,  gmsExecutableAbi, signer)
  try {
     const commandId = params.commandId;
      const sourceChain = params.sourceChain;
      const sourceAddress = params.sourceAddress;
      const payload = params.payload;
      const tokenSymbol = params.tokenSymbol;
      const amount = params.amount;
    const tx = await gmsExecutableContract.executeWithToken(commandId, sourceChain, sourceAddress, payload, tokenSymbol, amount);
    console.log("Transaction response:", tx);
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error calling emitMessage:", error);
  }
}

async function main() {
  //const {inputData,executeWithTokenParams} = utils.getPocMockInputs(51)
  const {inputData,executeWithTokenParams} = p2pUtils.getP2PBorrowingRequestGMPParams(100);
  await approveContractCall(inputData);
  //await callPocContract(executeWithTokenParams);
  await callP2PCallContract(executeWithTokenParams);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});