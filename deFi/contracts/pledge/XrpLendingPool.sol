// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "prb-math/contracts/PRBMathUD60x18.sol";
import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';

interface PriceOracle {
    function getPriceXRPUSDT() external view returns (uint256);
}

contract XrpLendingPoolV5 is AxelarExecutableWithToken {
    using PRBMathUD60x18 for uint256;

    // --- Constants ---
    bytes32 public constant SELECTOR_LEND = keccak256("contribute");
    bytes32 public constant SELECTOR_WITHDRAW = keccak256("withdraw");
    bytes32 public constant SELECTOR_CLAIM_REWARD = keccak256("claimReward");
    bytes32 public constant SELECTOR_BORROW = keccak256("borrow");
    bytes32 public constant SELECTOR_REPAY_LOAN = keccak256("repayLoan");
    bytes32 public constant SELECTOR_LIQUIDATE_LOAN = keccak256("liquidateLoan");

    string public constant supportedSourceChain = "XRPL_testnet";
    bytes32 public constant SUPPORTED_SOURCE_CHAIN_HASH = keccak256(bytes(supportedSourceChain));

    // --- Events ---
    event BorrowerEvent(string eventName, uint256 amount1, string borrower, uint256 borrowAmountUSD, uint256 amountPayableUSD, uint256 collateralAmountXRP, uint256 lastPayableUpdateTime, uint256 repaidUSD);
    event ContributorEvent(string eventName, uint256 amount1, string user,  uint256 contributionBalance, uint256 rewardDebt, uint256 confirmedRewards);
    event PoolRewardEvent(uint256 rewardDistributed, uint256 accRewardPerShareE18, uint256 equity, uint256 retainedEarning);

    // --- Structs ---
    struct BorrowerInfo {
        string borrower;
        uint256 borrowAmountUSD;
        uint256 amountPayableUSD;
        uint256 collateralAmountXRP;
        uint256 lastPayableUpdateTime;
        uint256 repaidUSD;
    }

    struct ContributorInfo {
        uint256 contributionBalance;
        uint256 rewardDebt;
        uint256 confirmedRewards;
    }

    // --- State Variables ---
    PriceOracle priceOracle;

    address private ownerAddress;

    // eg: currentXRPPriceUSD = 21164 means 1 XRP = 2.1164 USD
    uint256 public currentXRPPriceUSDE4;
    uint256 public lastPriceUpdateTimestamp = 0;
    

    // for managing borrowing
    
    // eg: 1.00026116 means daily rate is 0.026116%, means 10% annual rate as  1.00026116^365 = 1.1
    uint256 public dailyInterestFactorE18;
    uint256 public collateralRatioPc = 150; // Percentage
    uint256 public liquidationThresholdPc = 110; 
    

    // for managing rewards
    uint256 public lastRewardTimeStamp;
    uint256 public rewardInterval = 1 days;
    uint256 public retainedEarning = 0;
    uint256 public accRewardPerShareE18 = 0;
    
    uint256 public equity = 0;
    

    // Mapping to store loan data
    mapping(string => BorrowerInfo) public borrowers;
    mapping(string => ContributorInfo) public contributors;

    // --- Constructor ---
    constructor(address gateway_, address priceOracle_, uint256 dailyInterestFactorE18_) AxelarExecutableWithToken(gateway_) {
        priceOracle = PriceOracle(priceOracle_);
        dailyInterestFactorE18 = dailyInterestFactorE18_;
        lastRewardTimeStamp = block.timestamp;

        ownerAddress = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, "Not owner");
        _;
    }

    // --- Admin Functions ---
    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = PriceOracle(_priceOracle);
    }

    // --- Gateway Functions ---
    function _execute(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        require(keccak256(bytes(sourceChain)) == SUPPORTED_SOURCE_CHAIN_HASH, "Invalid source chain");

        string memory command;
        bytes memory params;
        (command, params) = abi.decode(payload, (string, bytes));
        bytes32 commandHash = keccak256(abi.encodePacked(command));
        if (commandHash == SELECTOR_CLAIM_REWARD) {
            claimReward(sourceChain, sourceAddress);
        } else if (commandHash == SELECTOR_WITHDRAW) {
            (uint256 withdrawAmount) = abi.decode(params, (uint256));
            withdraw(sourceChain, sourceAddress, withdrawAmount);
        } else {
            revert("Invalid command");
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
        require(amount > 0, "Invalid amount");
        require(keccak256(bytes(sourceChain)) == SUPPORTED_SOURCE_CHAIN_HASH, "Invalid source chain");

        string memory command;
        bytes memory params;
        (command, params) = abi.decode(payload, (string, bytes));
        bytes32 commandHash = keccak256(abi.encodePacked(command));
        if (commandHash == SELECTOR_LEND) {
            contribute(sourceChain, sourceAddress, tokenSymbol, amount);
        } else if (commandHash == SELECTOR_BORROW) {
            (uint256 borrowAmountUSD) = abi.decode(params, (uint256));
            borrow(sourceChain, sourceAddress, tokenSymbol, amount, borrowAmountUSD);
        } else if (commandHash == SELECTOR_REPAY_LOAN) {
            repayLoan(sourceChain, sourceAddress, tokenSymbol, amount);
        } else if (commandHash == SELECTOR_LIQUIDATE_LOAN) {
            liquidateLoan(sourceChain, sourceAddress, tokenSymbol, amount);
        } else {
            gateway().sendToken(sourceChain, sourceAddress, tokenSymbol, amount - 1);
            revert("Invalid command");
        }
    }

    /******************\
    |* Internal Functions *|
    \******************/

    // --- User Functions ---
    function contribute(string calldata sourceChain, string calldata sourceAddress, string calldata tokenSymbol, uint256 lendingAmount) internal {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        distributeRewards();

        ContributorInfo storage user = contributors[sourceAddress];
        updateRewardClaimable(user);

        user.contributionBalance += lendingAmount;
        equity += lendingAmount;
        emit ContributorEvent("contribute",lendingAmount, sourceAddress, user.contributionBalance, user.rewardDebt, user.confirmedRewards);
    }

    function withdraw(string calldata sourceChain, string calldata sourceAddress, uint256 withdrawAmount) internal {
        distributeRewards();

        ContributorInfo storage user = contributors[sourceAddress];
        updateRewardClaimable(user);

        require(user.contributionBalance >= withdrawAmount, "Insufficient balance");

        try gateway().sendToken(sourceChain, sourceAddress, "USD", withdrawAmount) {
            user.contributionBalance -= withdrawAmount;
            equity -= withdrawAmount;
            emit ContributorEvent("withdraw", withdrawAmount,sourceAddress, user.contributionBalance, user.rewardDebt, user.confirmedRewards);
        } catch {
            revert("Failed to send USD to user");
        }
    }

    function claimReward(string calldata sourceChain, string calldata sourceAddress) internal {
        distributeRewards();

        ContributorInfo storage user = contributors[sourceAddress];

        updateRewardClaimable(user);

        require(user.confirmedRewards > 0, "No rewards to claim");
        try gateway().sendToken(sourceChain, sourceAddress, "USD", user.confirmedRewards) {

           emit ContributorEvent("claimReward",user.confirmedRewards, sourceAddress, user.contributionBalance, user.rewardDebt, 0);
            user.confirmedRewards = 0;
        } catch {
            revert("Failed to send USD to user");
        }
    }

    function borrow (
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 xrpAmount,
        uint256 _borrowAmountUSD
    ) internal {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("XRP")), "Invalid token symbol");
        updatePrice();
        // time 10 up as collateral ratio is scaled by 100, and price is scaled by 1e4
        uint256 requiredCollateralXRP = (_borrowAmountUSD * collateralRatioPc * 100) / currentXRPPriceUSDE4;
        require(xrpAmount >= requiredCollateralXRP, "Insufficient collateral");

        BorrowerInfo storage existingBorrower = borrowers[sourceAddress];

        if (keccak256(bytes(existingBorrower.borrower)) != keccak256(bytes(""))) {
            updateAmountPayable(existingBorrower);

            try gateway().sendToken(sourceChain, sourceAddress, "USD", _borrowAmountUSD) {
                existingBorrower.borrowAmountUSD += _borrowAmountUSD;
                existingBorrower.collateralAmountXRP += xrpAmount;
                emit BorrowerEvent("borrow", _borrowAmountUSD, sourceAddress, existingBorrower.borrowAmountUSD, existingBorrower.amountPayableUSD, existingBorrower.collateralAmountXRP, existingBorrower.lastPayableUpdateTime, existingBorrower.repaidUSD);
            } catch {
                revert("Failed to send USD to user");
            }

        } else {
            try gateway().sendToken(sourceChain, sourceAddress, "USD", _borrowAmountUSD) {
                // Create Loan entry
                borrowers[sourceAddress] = BorrowerInfo({
                    borrower: sourceAddress,
                    borrowAmountUSD: _borrowAmountUSD,
                    amountPayableUSD: _borrowAmountUSD,
                    collateralAmountXRP: xrpAmount,
                    lastPayableUpdateTime: block.timestamp,
                    repaidUSD: 0
                });

                 emit BorrowerEvent("borrow", _borrowAmountUSD, sourceAddress, existingBorrower.borrowAmountUSD, existingBorrower.amountPayableUSD, existingBorrower.collateralAmountXRP, existingBorrower.lastPayableUpdateTime, existingBorrower.repaidUSD);
            } catch {
                revert("Failed to send USD to user");
            }
        }

        distributeRewards();
    }

    function repayLoan (
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 _repayAmountUSD
    ) internal {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
         BorrowerInfo storage borrower = borrowers[sourceAddress];


        require(keccak256(bytes(borrower.borrower)) == keccak256(bytes(sourceAddress)), "Not the loan owner");
         require(keccak256(bytes(borrower.borrower)) != keccak256(bytes("")), "Not an active loan");
        require(_repayAmountUSD > 0, "Repayment amount must be greater than zero");

        borrower.repaidUSD += _repayAmountUSD;
        updateAmountPayable(borrower);

        if(_repayAmountUSD >= borrower.amountPayableUSD) {
            
            try gateway().sendToken(sourceChain, sourceAddress, "XRP", borrower.collateralAmountXRP) {
                retainedEarning += borrower.repaidUSD - borrower.borrowAmountUSD;
                delete borrowers[sourceAddress];
            } catch {
                revert("Failed to send XRP to user");
            }
        } else {
           borrower.amountPayableUSD -= _repayAmountUSD;
        }

       emit BorrowerEvent("repayLoan", _repayAmountUSD, sourceAddress, borrower.borrowAmountUSD, borrower.amountPayableUSD, borrower.collateralAmountXRP, borrower.lastPayableUpdateTime, borrower.repaidUSD);
       
        distributeRewards();
    }

    // anyone can call, caller pays more than the total owed amount and gets the collateral
    function liquidateLoan(string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 _repayAmountUSD ) internal {
         BorrowerInfo storage borrower = borrowers[sourceAddress];

        
         require(keccak256(bytes(borrower.borrower)) != keccak256(bytes("")), "Not an active loan");


        updatePrice();
        updateAmountPayable(borrower);
        uint256 currentCollateralValueUSD = (borrower.collateralAmountXRP * currentXRPPriceUSDE4) / 1e4;
        uint256 liquidationThresholdPcValue = (borrower.amountPayableUSD * liquidationThresholdPc) / 100;

        // Check if loan is undercollateralized
        require(currentCollateralValueUSD < liquidationThresholdPcValue, "Cannot liquidate yet");
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(_repayAmountUSD >= borrower.amountPayableUSD, "Repayment amount must be greater than total owed");
        try gateway().sendToken(sourceChain, sourceAddress, "XRP", borrower.collateralAmountXRP) {
            retainedEarning += _repayAmountUSD - borrower.amountPayableUSD;
            delete borrowers[sourceAddress];
          
             emit BorrowerEvent("liquidateLoan", currentXRPPriceUSDE4, sourceAddress, borrower.borrowAmountUSD, borrower.amountPayableUSD, borrower.collateralAmountXRP, borrower.lastPayableUpdateTime, borrower.repaidUSD);
            distributeRewards();
        } catch {
            revert("Failed to send XRP to user");
        }
    }

    // --- Internal Functions ---
    // if user is not init. contributionBalance is 0, this also serves as a way to initialize user
    function updateRewardClaimable(ContributorInfo storage user) internal {
        uint256 updatedRewardDebt = (user.contributionBalance * accRewardPerShareE18) / 1e18;
        uint256 pending =updatedRewardDebt - user.rewardDebt;
        user.rewardDebt = updatedRewardDebt;
        user.confirmedRewards += pending;
    }

    function updateAmountPayable(BorrowerInfo storage borrower) internal {
         if (keccak256(bytes(borrower.borrower)) == keccak256(bytes(""))) return;

        uint256 timeElapsed = block.timestamp - borrower.lastPayableUpdateTime;
        uint256 daysElapsed = timeElapsed / 1 days;
       
        if (daysElapsed == 0) return;

        uint256 factor = (dailyInterestFactorE18).pow(daysElapsed);
        borrower.amountPayableUSD = borrower.amountPayableUSD.mul(factor) / 1e18;
        borrower.lastPayableUpdateTime = block.timestamp;
    }

    function distributeRewards() internal {
        // Check if enough time has passed since last distribution
        if (block.timestamp < lastRewardTimeStamp + rewardInterval) {
            return;
        }

        if (retainedEarning == 0) return;

        // Update accumulated reward per share
        accRewardPerShareE18 += (retainedEarning * 1e18) / equity ;
        uint256 rewardAmount = retainedEarning;
        retainedEarning = 0;
        lastRewardTimeStamp = block.timestamp;

        emit PoolRewardEvent(rewardAmount, accRewardPerShareE18, equity, retainedEarning);
    }

    function updatePrice() internal {
        // Update price no more frequently than once every hour
        if (block.timestamp - lastPriceUpdateTimestamp >= 3600) {
            currentXRPPriceUSDE4 = priceOracle.getPriceXRPUSDT();
            lastPriceUpdateTimestamp = block.timestamp;
        }
    }

    // --- View Functions ---
    function getBorrowerInfo(string memory _user) public view returns (BorrowerInfo memory) {
        return borrowers[_user];
    }

    function getContributorInfo(string memory _user) public view returns (ContributorInfo memory) {
        return contributors[_user];
    }
}