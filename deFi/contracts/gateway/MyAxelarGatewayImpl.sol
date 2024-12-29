// SPDX-License-Identifier: MIT
//https://arbiscan.io/address/0x99b5fa03a5ea4315725c43346e55a6a6fbd94098#code
pragma solidity ^0.8.0;

import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';
import { EternalStorage } from './EternalStorage.sol';
/**
 * @title AxelarGateway Contract
 * @notice This contract serves as the gateway for cross-chain contract calls,
 * and token transfers within the Axelar network.
 * It includes functions for sending tokens, calling contracts, and validating contract calls.
 * The contract is managed via the decentralized governance mechanism on the Axelar network.
 * @dev EternalStorage is used to simplify storage for upgradability, and InterchainGovernance module is used for governance.
 */
contract MyAxelarGatewayImpl is IMyAxelarGateway,EternalStorage{
    bytes32 internal constant PREFIX_COMMAND_EXECUTED = keccak256('command-executed');
    bytes32 internal constant PREFIX_CONTRACT_CALL_APPROVED = keccak256('contract-call-approved');
    bytes32 internal constant PREFIX_CONTRACT_CALL_APPROVED_WITH_MINT = keccak256('contract-call-approved-with-mint');
    
    bytes32 internal constant SELECTOR_APPROVE_CONTRACT_CALL = keccak256('approveContractCall');
    bytes32 internal constant SELECTOR_APPROVE_CONTRACT_CALL_WITH_MINT = keccak256('approveContractCallWithMint');
    
    // mock mint and burn
    string usd_symble = 'USD';
    string xrp_symble = 'XRP';
    mapping(address => uint256) public mockMintedUsdTokens;
    mapping(address => uint256) public mockMintedXrpTokens;
    
    address public immutable authModule;

    constructor(address authModule_) {
        authModule = authModule_;
    }

    /**
     * @notice Ensures that the caller of the function is the gateway contract itself.
     */
    modifier onlyAuthModule() {
        require(msg.sender == authModule, "Caller is not the auth module");
        _;
    }
    modifier onlySelf() {
        require(msg.sender == address(this), "Caller is not the contract itself");
        _;
    }

    /******************\
    |* Public Methods *|
    \******************/

    /**
     * @notice Send the specified token to the destination chain and address.
     * @param destinationChain The chain to send tokens to. A registered chain name on Axelar must be used here
     * @param destinationAddress The address on the destination chain to send tokens to
     * @param symbol The symbol of the token to send
     * @param amount The amount of tokens to send
     */
    function sendToken(
        string calldata destinationChain,
        string calldata destinationAddress,
        string calldata symbol,
        uint256 amount
    ) external {
        _burnTokenFrom(msg.sender, symbol, amount);
        emit TokenSent(msg.sender, destinationChain, destinationAddress, symbol, amount);
    }


    /**
     * @notice Checks whether a contract call has been approved by the gateway.
     * @param commandId The gateway command ID
     * @param sourceChain The source chain of the contract call
     * @param sourceAddress The source address of the contract call
     * @param contractAddress The contract address that will be called
     * @param payloadHash The hash of the payload for that will be sent with the call
     * @return bool A boolean value indicating whether the contract call has been approved by the gateway.
     */
    function isContractCallApproved(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        address contractAddress,
        bytes32 payloadHash
    ) external view returns (bool) {
        return getBool(_getIsContractCallApprovedKey(commandId, sourceChain, sourceAddress, contractAddress, payloadHash));
    }

    /**
     * @notice Checks whether a contract call with token has been approved by the gateway.
     * @param commandId The gateway command ID
     * @param sourceChain The source chain of the contract call
     * @param sourceAddress The source address of the contract call
     * @param contractAddress The contract address that will be called, and where tokens will be sent
     * @param payloadHash The hash of the payload for that will be sent with the call
     * @param symbol The symbol of the token to be sent with the call
     * @param amount The amount of tokens to be sent with the call
     * @return bool A boolean value indicating whether the contract call with token has been approved by the gateway.
     */
    function isContractCallAndMintApproved(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        address contractAddress,
        bytes32 payloadHash,
        string calldata symbol,
        uint256 amount
    ) external view returns (bool) {
        return
            getBool(
                _getIsContractCallApprovedWithMintKey(commandId, sourceChain, sourceAddress, contractAddress, payloadHash, symbol, amount)
            );
    }

    /**
     * @notice Called on the destination chain gateway by the recipient of the cross-chain contract call to validate it and only allow execution
     * if this function returns true.
     * @dev Once validated, the gateway marks the message as executed so the contract call is not executed twice.
     * @param commandId The gateway command ID
     * @param sourceChain The source chain of the contract call
     * @param sourceAddress The source address of the contract call
     * @param payloadHash The hash of the payload for that will be sent with the call
     * @return valid True if the contract call is approved, false otherwise
     */
    function validateContractCall(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes32 payloadHash
    ) external override returns (bool valid) {
        bytes32 key = _getIsContractCallApprovedKey(commandId, sourceChain, sourceAddress, msg.sender, payloadHash);
        valid = getBool(key);
        if (valid) {
            _setBool(key, false);

            emit ContractCallExecuted(commandId);
        }
    }

    /**
     * @notice Called on the destination chain gateway to validate the approval of a contract call with token transfer and only
     * allow execution if this function returns true.
     * @dev Once validated, the gateway marks the message as executed so the contract call with token is not executed twice.
     * @param commandId The gateway command ID
     * @param sourceChain The source chain of the contract call
     * @param sourceAddress The source address of the contract call
     * @param payloadHash The hash of the payload for that will be sent with the call
     * @param symbol The symbol of the token to be sent with the call
     * @param amount The amount of tokens to be sent with the call
     * @return valid True if the contract call with token is approved, false otherwise
     */
    function validateContractCallAndMint(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes32 payloadHash,
        string calldata symbol,
        uint256 amount
    ) external override returns (bool valid) {
        bytes32 key = _getIsContractCallApprovedWithMintKey(commandId, sourceChain, sourceAddress, msg.sender, payloadHash, symbol, amount);
        valid = getBool(key);
        if (valid) {
            // Prevent re-entrancy
            _setBool(key, false);

            emit ContractCallExecuted(commandId);

            _mintToken(symbol, msg.sender, amount);
        }
    }

    /**
     * @notice Checks whether a command with a given command ID has been executed.
     * @param commandId The command ID to check
     * @return bool True if the command has been executed, false otherwise
     */
    
    function isCommandExecuted(bytes32 commandId) public view override returns (bool) {
        return getBool(_getIsCommandExecutedKey(commandId));
    }

    /**********************\
    |* External Functions *|
    \**********************/

    /**
     * @notice Executes a batch of commands signed by the Axelar network. There are a finite set of command types that can be executed.
     * @param input The encoded input containing the data for the batch of commands, as well as the proof that verifies the integrity of the data.
     * @dev Each command has a corresponding commandID that is guaranteed to be unique from the Axelar network.
     * @dev This function allows retrying a commandID if the command initially failed to be processed.
     * @dev Ignores unknown commands or duplicate commandIDs.
     * @dev Emits an Executed event for successfully executed commands.
     */
    // slither-disable-next-line cyclomatic-complexity
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

    /******************\
    |* Self Functions *|
    \******************/

    /**
     * @notice Approves a contract call.
     * @param params Encoded parameters including the source chain, source address, contract address, payload hash, transaction hash, and event index
     * @param commandId to associate with the approval
     */
    function approveContractCall(bytes calldata params, bytes32 commandId) external onlySelf {
        (
            string memory sourceChain,
            string memory sourceAddress,
            address contractAddress,
            bytes32 payloadHash,
            bytes32 sourceTxHash,
            uint256 sourceEventIndex
        ) = abi.decode(params, (string, string, address, bytes32, bytes32, uint256));

        _setContractCallApproved(commandId, sourceChain, sourceAddress, contractAddress, payloadHash);
        emit ContractCallApproved(commandId, sourceChain, sourceAddress, contractAddress, payloadHash, sourceTxHash, sourceEventIndex);
    }

    /**
     * @notice Approves a contract call with token transfer.
     * @param params Encoded parameters including the source chain, source address, contract address, payload hash, token symbol,
     * token amount, transaction hash, and event index.
     * @param commandId to associate with the approval
     */
    function approveContractCallWithMint(bytes calldata params, bytes32 commandId) external onlySelf {
        (
            string memory sourceChain,
            string memory sourceAddress,
            address contractAddress,
            bytes32 payloadHash,
            string memory symbol,
            uint256 amount,
            bytes32 sourceTxHash,
            uint256 sourceEventIndex
        ) = abi.decode(params, (string, string, address, bytes32, string, uint256, bytes32, uint256));

        _setContractCallApprovedWithMint(commandId, sourceChain, sourceAddress, contractAddress, payloadHash, symbol, amount);
        emit ContractCallApprovedWithMint(
            commandId,
            sourceChain,
            sourceAddress,
            contractAddress,
            payloadHash,
            symbol,
            amount,
            sourceTxHash,
            sourceEventIndex
        );
    }

    /********************\
    |* Internal Methods *|
    \********************/

    function _mintToken(
        string memory symbol,
        address account,
        uint256 amount
    ) internal {
        // pretends to mint tokens
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked(usd_symble))) {
            mockMintedUsdTokens[account] += amount;
        } else if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked(xrp_symble))) {
            mockMintedXrpTokens[account] += amount;
        } else {
            revert InvalidTokenSymbol();
        }
    }

    /**
     * @notice Burns or locks a specific amount of tokens from a sender's account based on the provided symbol.
     * @param sender Address of the account from which to burn the tokens
     * @param symbol Symbol of the token to burn
     * @param amount Amount of tokens to burn
     * @dev Depending on the token type (External, InternalBurnableFrom, or InternalBurnable), the function either
     * transfers the tokens to gateway contract itself or calls a burn function on the token contract.
     */
    function _burnTokenFrom(
        address sender,
        string memory symbol,
        uint256 amount
    ) internal {
        // pretends to burn tokens
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked(usd_symble))) {
            if (mockMintedUsdTokens[sender] < amount) {
                revert InsufficientBalance();
            }
            mockMintedUsdTokens[sender] -= amount;
        } else if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked(xrp_symble))) {
            if (mockMintedXrpTokens[sender] < amount) {
                revert InsufficientBalance();
            }
            mockMintedXrpTokens[sender] -= amount;
        } else {
            revert InvalidTokenSymbol();
        }
    }

    /********************\
    |* Pure Key Getters *|
    \********************/

    function _getIsCommandExecutedKey(bytes32 commandId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(PREFIX_COMMAND_EXECUTED, commandId));
    }

    function _getIsContractCallApprovedKey(
        bytes32 commandId,
        string memory sourceChain,
        string memory sourceAddress,
        address contractAddress,
        bytes32 payloadHash
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(PREFIX_CONTRACT_CALL_APPROVED, commandId, sourceChain, sourceAddress, contractAddress, payloadHash));
    }

    function _getIsContractCallApprovedWithMintKey(
        bytes32 commandId,
        string memory sourceChain,
        string memory sourceAddress,
        address contractAddress,
        bytes32 payloadHash,
        string memory symbol,
        uint256 amount
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PREFIX_CONTRACT_CALL_APPROVED_WITH_MINT,
                    commandId,
                    sourceChain,
                    sourceAddress,
                    contractAddress,
                    payloadHash,
                    symbol,
                    amount
                )
            );
    }


    /********************\
    |* Internal Setters *|
    \********************/

    function _setCommandExecuted(bytes32 commandId, bool executed) internal {
        _setBool(_getIsCommandExecutedKey(commandId), executed);
    }

    function _setContractCallApproved(
        bytes32 commandId,
        string memory sourceChain,
        string memory sourceAddress,
        address contractAddress,
        bytes32 payloadHash
    ) internal {
        _setBool(_getIsContractCallApprovedKey(commandId, sourceChain, sourceAddress, contractAddress, payloadHash), true);
    }

    function _setContractCallApprovedWithMint(
        bytes32 commandId,
        string memory sourceChain,
        string memory sourceAddress,
        address contractAddress,
        bytes32 payloadHash,
        string memory symbol,
        uint256 amount
    ) internal {
        _setBool(
            _getIsContractCallApprovedWithMintKey(commandId, sourceChain, sourceAddress, contractAddress, payloadHash, symbol, amount),
            true
        );
    }
}