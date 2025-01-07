import { ethers } from "ethers";
import dotenv from "dotenv";
import * as utils from "./utils.js"
import * as p2pUtils from "./p2pPayloadUtil.js"
import * as pledgeUtils from "./pledgePayloadUtil.js"
import * as optionUtils from "./optionPayloadUtil.js"
dotenv.config();

// Define the provider (XRPL EVM endpoint)
const provider = new ethers.JsonRpcProvider("https://rpc-evm-sidechain.xrpl.org");

// Define the signer (using private key)
const privateKey = process.env.PRIVATE_KEY;
const authModule = process.env.PUBLIC_ADDRESS;
const signer = new ethers.Wallet(privateKey, provider);

// Function to call the emitMessage function on the contract
async function approveContractCallWithMint(input) {
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

async function callP2PContract(params) {
  console.log("Calling P2P Contract with address:", process.env.XRP_LENDING_P2P);
  await callContract(params, process.env.XRP_LENDING_P2P);
}

async function callPoolContract(params) {
  console.log("Calling P2P Contract with address:", process.env.XRP_LENDING_POOL);
  await callContract(params, process.env.XRP_LENDING_POOL);
}

async function callOptionContract(params) {
  console.log("Calling Option Contract with address:", process.env.OPTION_TRADING);
  await callContract(params, process.env.OPTION_TRADING);
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
  function prepareBorrowPayload(borrowAmountUSD) {
    const command = "borrow";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [borrowAmountUSD]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}
  
  //const {inputData,executeWithTokenParams} = utils.getPocMockInputs(51)
  const {inputData,executeWithTokenParams} = p2pUtils.getP2PLendingRequestGMPParams();
  //const payloadStr = "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000146372656174654c656e64696e675265717565737400000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000960000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000006e000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000000a"
  //const {inputData,executeWithTokenParams} = pledgeUtils.getBorrowGMPParams(150,201);
  //console.log("inputData",inputData);
  //const {inputData,executeWithTokenParams} = optionUtils.getIssueCallOptionGMPParams(200,100,101);
  //await approveContractCallWithMint(inputData);
  //await callP2PContract(executeWithTokenParams);
  const param = {
    commandId: "0x8a86c8ff846d3428146cac6f70ef1bb4f5bdbdcecb13252b4cad9110f4e955ef",
    sourceChain: "XRPL_testnet",
    sourceAddress: "rB8KX92KiXugoNncVb6uAMkXtDTeo3BVcU",
    payload: "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000146372656174654c656e64696e675265717565737400000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000096000000000000000000000000000000000000000000000000000000000000006e000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000064",
    tokenSymbol: "USD",
    amount: 100
  }
  //executeWithTokenParams.commandId = param.commandId;
  //executeWithTokenParams.sourceAddress = param.sourceAddress;
  const payloadHash = ethers.keccak256(param.payload);
  console.log("Payload Hash:", payloadHash);
  await callP2PContract(param)
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});