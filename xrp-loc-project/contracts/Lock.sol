// contracts/Lock.sol
pragma solidity ^0.8.0;

contract Lock {
    struct LockedToken {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => LockedToken) public lockedTokens;

    event TokensLocked(address indexed user, uint256 amount, uint256 unlockTime);

    function lockTokens(uint256 amount, uint256 lockTime) public {
        require(amount > 0, "Amount must be greater than 0");
        require(lockTime > block.timestamp, "Lock time must be in the future");

        lockedTokens[msg.sender] = LockedToken(amount, lockTime);
        emit TokensLocked(msg.sender, amount, lockTime);
    }

    function getLockedTokens(address user) public view returns (uint256 amount, uint256 unlockTime) {
        LockedToken memory lockedToken = lockedTokens[user];
        return (lockedToken.amount, lockedToken.unlockTime);
    }
}