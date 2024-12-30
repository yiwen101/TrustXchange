// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';

contract TestGMSExecutable is AxelarExecutableWithToken {
    event Executed(string _sourceChain, string _sourceAddress,  string _tokenSymbol, uint256 _tokenAmount);
    event ExecutedWithToken(string _sourceChain, string _sourceAddress,  string _tokenSymbol, uint256 _tokenAmount);

    constructor(address gateway_) AxelarExecutableWithToken(gateway_) {
    }

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

    function _executeWithToken(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload,
        string calldata tokenSymbol,
        uint256 amount
    ) internal override {
        emit ExecutedWithToken(sourceChain, sourceAddress, tokenSymbol, amount);
    }
}