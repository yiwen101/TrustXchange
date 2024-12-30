import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const keccak256 = ethers.keccak256;
const toUtf8Bytes = ethers.toUtf8Bytes;
// Replace with actual selectors if necessary
const SELECTOR_APPROVE_CONTRACT_CALL = keccak256(toUtf8Bytes("approveContractCall(bytes,bytes32)"));
const SELECTOR_APPROVE_CONTRACT_CALL_WITH_MINT = keccak256(toUtf8Bytes("approveContractCallWithMint(bytes,bytes32)"));

function prepareCommandData(chainId, commandIds, commands, params) {
    /**Encodes command data for the smart contract's execute method.

    Args:
        chain_id: The chain ID.
        command_ids: A list of command IDs (bytes32).
        commands: A list of command names (strings).
        params: A list of command parameters (bytes).

    Returns:
         The abi encoded data.
    */
    return ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "bytes32[]", "string[]", "bytes[]"],
        [chainId, commandIds, commands, params]
    );
}

function prepareExecuteInput(data, proof) {
     /**Encodes the full input for the smart contract's execute method.

    Args:
        data: The encoded command data.
        proof: The proof bytes.

    Returns:
        The abi encoded execute input.
    */
    return ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes", "bytes"],
        [data, proof]
    );
}

function createCommandId(commandName, paramBytes, nonce = 0) {
     /**Creates a deterministic commandId from params.*/
    const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "bytes", "uint256"],
        [commandName, paramBytes, nonce]
    );
    return keccak256(encodedData);
}

function createGatewayCallParams(
    sourceChain,
    sourceAddress,
    contractAddress,
    payloadHash,
    sourceTxHash,
    sourceEventIndex
    ) {
     /**Creates a gateway call params*/
    return ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "string", "address", "bytes32", "bytes32", "uint256"],
        [sourceChain, sourceAddress, contractAddress, payloadHash, sourceTxHash, sourceEventIndex]
    );
}

function createGatewayCallWithMintParams(
    sourceChain,
    sourceAddress,
    contractAddress,
    payloadHash,
    symbol,
    amount,
    sourceTxHash,
    sourceEventIndex
    ) {
     /**Creates a gateway call with mint params*/
    return ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "string", "address", "bytes32", "string", "uint256", "bytes32", "uint256"],
        [sourceChain, sourceAddress, contractAddress, payloadHash, symbol, amount, sourceTxHash, sourceEventIndex]
    );
}

// not reusable
function createExecutePayload(message) {
    /** Creates a payload for the `_execute` function.
     * @param {string} tokenDenom - The token denomination.
     * @param {number|bigint} tokenAmount - The amount of tokens.
     * @returns {string} The ABI-encoded payload as a hex string.
     */
    return ethers.AbiCoder.defaultAbiCoder().encode(
        ["string"],
        [message]
    );
}

export function getMockInputs() {
    const tokenDenom = 1;
    const chainId = 1;  // Example Chain ID
    const contractAddress = process.env.MY_GATEWAY_ADDRESS;
    const mintRecipient = process.env.GMS_EXECUTABLE_ADDRESS;
    const payloadBytes = createExecutePayload("hello world")
    const payloadHash = keccak256(payloadBytes);
    const mintAmount = 100;
    const sourceChain = "xrp testnet string";
    const sourceAddress = "source chain address string";
    const sourceTxHash = keccak256(toUtf8Bytes("ignored"));
    const sourceEventIndex = 0;

    /*
    const commandName1 = "approveContractCall";
    const params1 = createGatewayCallParams(
        sourceChain,
        sourceAddress,
        contractAddress,
        payloadHash,
        sourceTxHash,
        sourceEventIndex
        );
    const commandId1 = createCommandId(commandName1, params1);
    */

    // Command 2: Approve Contract Call With Mint
    const param = createGatewayCallWithMintParams(
        sourceChain,
        sourceAddress,
        contractAddress,
        payloadHash,
        "USD",
        100,
        sourceTxHash,
        sourceEventIndex
        );
    const commandId = createCommandId("approveContractCallWithMint", param);
    const commandIds = [commandId];
    const commands = ["approveContractCallWithMint"];
    const params = [param];

    const data = prepareCommandData(chainId, commandIds, commands, params);
    const proof = toUtf8Bytes("some_proof"); 
    const inputData = prepareExecuteInput(data, proof);

    console.log("Input data (hex):", ethers.hexlify(inputData));
    return {inputData,payloadBytes}
}