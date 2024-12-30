// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';

contract TestGMSExecutableV3 is AxelarExecutableWithToken {
    event Executed(string _sourceChain, string _sourceAddress, string message);
    event ExecutedWithToken(string _sourceChain, string _sourceAddress, string message);
    event ExecutionFailed(string _sourceChain, string _sourceAddress, string reason);
    event ExecutionWithTokenFailed(string _sourceChain, string _sourceAddress, string reason);

    error DecodingError(string reason);
    error AmountCheckFailed(uint256 amount);
    error SendTokenFailed(string reason);

    constructor(address gateway_) AxelarExecutableWithToken(gateway_) {
    }

    function _execute(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        string memory message = abi.decode(payload, (string));
        emit Executed(sourceChain, sourceAddress, message);
    }

    function _executeWithToken(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload,
        string calldata tokenSymbol,
        uint256 amount
    ) internal override {
        string memory message = abi.decode(payload, (string));

        if (amount > 10) {
            try gateway().sendToken(sourceChain, sourceAddress, tokenSymbol, amount - 1) {
                emit ExecutedWithToken(sourceChain, sourceAddress, message);
            } catch (bytes memory err) {
                 emit ExecutionWithTokenFailed(sourceChain, sourceAddress, "Failed to send token");
                revert SendTokenFailed("Failed to send token");
            }
        } else {
            emit ExecutedWithToken(sourceChain, sourceAddress, "amount less than 10");
        }
    }
}