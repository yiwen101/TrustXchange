// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Emit {
    // Event to be emitted
    event MessageEmitted(string message);

    // Function to emit the event with a message
    function emitMessage(string calldata _message) external {
        emit MessageEmitted(_message);
    }
}