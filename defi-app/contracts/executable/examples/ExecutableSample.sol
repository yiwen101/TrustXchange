// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AxelarExecutable } from '../AxelarExecutable.sol';
import { IAxelarGateway } from '../../interfaces/IAxelarGateway.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract DeFiApp is AxelarExecutable {
    string public sourceChain;
    string public sourceAddress;
    string public message;
    string public tokenDenom;
    uint256 public tokenAmount;

    uint256 public keptAmount;
    uint256 public releaseTime;

    event Executed(string _sourceChain, string _sourceAddress, string _message, string _tokenSymbol, uint256 _tokenAmount);
    event Kept(address indexed user, uint256 amount, uint256 time);
    event Extracted(address indexed user, uint256 amount);

    constructor(address gateway_) AxelarExecutable(gateway_) {
    }

    function _execute(
        string calldata sourceChain_,
        string calldata sourceAddress_,
        bytes calldata payload_
    ) internal override {
        bytes memory gmpPayload;
        (tokenDenom, tokenAmount, gmpPayload) = abi.decode(payload_, (string, uint256, bytes));
        (message) = abi.decode(gmpPayload, (string));
        sourceChain = sourceChain_;
        sourceAddress = sourceAddress_;

        emit Executed(sourceChain, sourceAddress, message, IAxelarGateway(gateway).tokenSymbol(tokenDenom), tokenAmount);
    }

    function keep(uint256 amount, uint256 time) external {
        require(amount > 0, "Amount must be greater than 0");
        require(time > block.timestamp, "Time must be in the future");

        IERC20 token = IERC20(IAxelarGateway(gateway).tokenAddress(tokenDenom));
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        keptAmount = amount;
        releaseTime = time;

        emit Kept(msg.sender, amount, time);
    }

    function extract() external {
        require(block.timestamp >= releaseTime, "Current time is before release time");
        require(keptAmount > 0, "No tokens to extract");

        IERC20 token = IERC20(IAxelarGateway(gateway).tokenAddress(tokenDenom));
        uint256 amount = keptAmount;

        keptAmount = 0;
        releaseTime = 0;

        require(token.transfer(msg.sender, amount), "Transfer failed");

        emit Extracted(msg.sender, amount);
    }
}