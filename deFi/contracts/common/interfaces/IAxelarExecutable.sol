// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IMyAxelarGateway } from './IMyAxelarGateway.sol';

interface IAxelarExecutable {
    error InvalidAddress();
    error NotApprovedByGateway();

    function gateway() external view returns (IMyAxelarGateway);

    function execute(bytes32 commandId, string calldata sourceChain, string calldata sourceAddress, bytes calldata payload) external;
}