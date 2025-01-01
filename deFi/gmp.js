import { ethers } from "ethers";
import dotenv from "dotenv";
import * as utils from "./utils.js"
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
async function callContract(params) {
  const gmsExecutableAbi = [
    "error DecodingError(string reason)",
    "error AmountCheckFailed(uint256 amount)",
    "error SendTokenFailed(string reason)",
    "function executeWithToken(bytes32 commandId,string calldata sourceChain,string calldata sourceAddress,bytes calldata payload,string calldata tokenSymbol,uint256 amount) external"
  ];
  const gmsExecutableAddress = process.env.GMS_EXECUTABLE_ADDRESS;
  console.log('gmsExecutableAddress: ', gmsExecutableAddress);
  const gmsExecutableContract = new ethers.Contract(gmsExecutableAddress,  gmsExecutableAbi, signer)
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
  const {inputData,executeWithTokenParams} = utils.getPocMockInputs(50)
  await approveContractCall(inputData);
  await callContract(executeWithTokenParams);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});