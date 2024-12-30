import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

/*
    function execute(bytes calldata input) external onlyAuthModule {
        (bytes memory data, bytes memory proof) = abi.decode(input, (bytes, bytes));

        //bytes32 messageHash = ECDSA.toEthSignedMessageHash(keccak256(data));

        //bool allowOperatorshipTransfer = IAxelarAuth(authModule).validateProof(messageHash, proof);

        uint256 chainId;
        bytes32[] memory commandIds;
        string[] memory commands;
        bytes[] memory params;

        (chainId, commandIds, commands, params) = abi.decode(data, (uint256, bytes32[], string[], bytes[]));

        //if (chainId != block.chainid) revert InvalidChainId();

        uint256 commandsLength = commandIds.length;

        if (commandsLength != commands.length || commandsLength != params.length) revert InvalidCommands();

        for (uint256 i; i < commandsLength; ++i) {
            bytes32 commandId = commandIds[i];

            // Ignore if duplicate commandId received
            if (isCommandExecuted(commandId)) continue;

            bytes4 commandSelector;
            bytes32 commandHash = keccak256(abi.encodePacked(commands[i]));
            if (commandHash == SELECTOR_APPROVE_CONTRACT_CALL) {
                commandSelector = MyAxelarGatewayImpl.approveContractCall.selector;
            } else if (commandHash == SELECTOR_APPROVE_CONTRACT_CALL_WITH_MINT) {
                commandSelector = MyAxelarGatewayImpl.approveContractCallWithMint.selector;
            }  else {
                // Ignore unknown commands
                continue;
            }

            // Prevent a re-entrancy from executing this command before it can be marked as successful.
            _setCommandExecuted(commandId, true);

            // slither-disable-next-line calls-loop,reentrancy-no-eth
            (bool success, ) = address(this).call(abi.encodeWithSelector(commandSelector, params[i], commandId));

            // slither-disable-next-line reentrancy-events
            if (success) emit Executed(commandId);
            else _setCommandExecuted(commandId, false);
        }
    }
*/


// Define the provider (XRPL EVM endpoint)
const provider = new ethers.JsonRpcProvider("https://rpc-evm-sidechain.xrpl.org");

// Define the signer (using private key)
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_ADDRESS;
const signer = new ethers.Wallet(privateKey, provider);

// Function to call the emitMessage function on the contract
async function approveContractCall(data, proof) {
  const gatewayAbi = [
    "function execute(bytes calldata input) external"
  ];
  const gatewayAddress = process.env.MY_GATEWAY_ADDRESS;
  const gatewayContract = new ethers.Contract(gatewayAddress,  gatewayAbi, signer);
  // todo, implement
  let bytes_input;
  try {
    const tx = await gatewayContract.execute(bytes_input);
    console.log("Transaction response:", tx);
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error calling emitMessage:", error);
  }
}


/*
function _execute(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        (string memory tokenDenom, uint256 tokenAmount) = abi.decode(payload, (string, uint256));
        if(tokenAmount > 1) {
            gateway().sendToken(sourceChain, sourceAddress, tokenDenom, tokenAmount - 1);
            emit Executed(sourceChain, sourceAddress, tokenDenom, tokenAmount-1);
        } else {
            emit Executed(sourceChain, sourceAddress, tokenDenom, 0);
        }
    }
*/
async function callContract() {
  const gmsExecutableAbi = [
    "function execute(bytes32 commandId, string calldata sourceChain, string calldata sourceAddress, bytes calldata payload) external"
  ];
  const gmsExecutableAddress = process.env.GMS_EXECUTABLE_ADDRESS;
  const gmsExecutableContract = new ethers.Contract(gmsExecutableAddress,  gmsExecutableAbi, signer)
  try {
    const tx = await gmsExecutableContract.execute(...)
    console.log("Transaction response:", tx);
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error calling emitMessage:", error);
  }
}