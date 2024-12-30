const { ethers } = require("ethers");
const { keccak256, toUtf8Bytes} = require("ethers/lib/utils");
import dotenv from "dotenv";
dotenv.config();

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
function createExecutePayload(tokenDenom, tokenAmount) {
    /** Creates a payload for the `_execute` function.
     * @param {string} tokenDenom - The token denomination.
     * @param {number|bigint} tokenAmount - The amount of tokens.
     * @returns {string} The ABI-encoded payload as a hex string.
     */
    return ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "uint256"],
        [tokenDenom, tokenAmount]
    );
}


async function main() {
    const tokenDenom = 1;
    // Example usage
    const chainId = 1;  // Example Chain ID
    const contractAddress = process.end.MY_GATEWAY_ADDRESS;
    const mintRecipient = process.end.GMS_EXECUTABLE_ADDRESS;
    const payloadHash = keccak256(toUtf8Bytes("some payload data"));
    const mintAmount = 100;
    const sourceChain = "Avalanche";
    const sourceAddress = "0x0001";
    const symbol = "XRP";
    const sourceTxHash = keccak256(toUtf8Bytes("some tx hash"));
    const sourceEventIndex = 0;

    // Command 1: Approve Contract Call
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

    // Command 2: Approve Contract Call With Mint
    const commandName2 = "approveContractCallWithMint";
    const params2 = createGatewayCallWithMintParams(
        sourceChain,
        sourceAddress,
        contractAddress,
        payloadHash,
        symbol,
        mintAmount,
        sourceTxHash,
        sourceEventIndex
        );
    const commandId2 = createCommandId(commandName2, params2);



    const commandIds = [commandId1, commandId2];
    const commands = [commandName1, commandName2];
    const params = [params1, params2];

    const data = prepareCommandData(chainId, commandIds, commands, params);
    const proof = toUtf8Bytes("some_proof"); // Replace with actual proof
    const inputData = prepareExecuteInput(data, proof);

    console.log("Input data (hex):", ethers.hexlify(inputData));
      // You can use this input_data to call the execute method
    // on your contract using web3.eth.contract().functions.execute(input_data).transact({...})
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });