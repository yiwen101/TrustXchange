// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "prb-math/contracts/PRBMathUD60x18.sol";
import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';

interface PriceOracle {
    function getPriceXRPUSDT() external view returns (uint256);
}

contract XrpLendingPoolV2 is AxelarExecutableWithToken {
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
    event LiquidityAdded(string indexed user, uint256 amount, uint256 confirmedRewards, uint256 contributionBalance, uint256 rewardDebt);
    event LiquidityWithdrawn(string indexed user, uint256 amount, uint256 confirmedRewards, uint256 contributionBalance, uint256 rewardDebt);
    event RewardsClaimed(string indexed user, uint256 rewardsToClaim, uint256 confirmedRewards, uint256 contributionBalance, uint256 rewardDebt);
    event LoanCreated(uint256 indexed loanId, string indexed borrower, uint256 borrowAmountUSD, uint256 collateralAmountXRP, uint256 lastInterestUpdateTime);
    event LoanUpdated(uint256 indexed loanId, string indexed borrower, uint256 borrowAmountUSD, uint256 collateralAmountXRP, uint256 lastInterestUpdateTime);
    event LoanRepaid(uint256 indexed loanId, uint256 repaidAmountUSD, uint256 remainingAmountPayableUSD);
    event LoanLiquidated(uint256 indexed loanId, uint256 collateralValueUSD, uint256 amountPayableUSD, uint256 currentPriceUSD);
    event RewardsDistributed(uint256 rewardAmount, uint256 accRewardPerShareE18);

    // --- Structs ---
    struct Loan {
        string borrower;
        uint256 borrowAmountUSD;
        uint256 amountPayableUSD;
        uint256 collateralAmountXRP;
        uint256 lastPayableUpdateTime;
        uint256 repaidUSD;
        bool isLiquidated;
    }

    struct UserInfo {
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
    uint256 public interestRatePc = 10; // Annual percentage
    uint256 public liquidationThresholdPc = 120; 
    

    // for managing rewards
    uint256 public lastRewardTimeStamp;
    uint256 public rewardInterval = 1 days;
    uint256 public retainedEarning = 0;
    uint256 public accRewardPerShareE18 = 0;
    
    uint256 public loanCounter = 0;
    uint256 public totalLiquidity = 0;
    


    // Mapping to store loan data
    mapping(uint256 => Loan) public loans;
    mapping(string => uint256) public userLoan; 
    mapping(string => UserInfo) public userInfo;

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
            (uint256 loanId) = abi.decode(params, (uint256));
            repayLoan(sourceChain, sourceAddress, tokenSymbol, amount, loanId);
        } else if (commandHash == SELECTOR_LIQUIDATE_LOAN) {
            (uint256 loanId) = abi.decode(params, (uint256));
            liquidateLoan(sourceChain, sourceAddress, tokenSymbol, amount,loanId);
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

        UserInfo storage user = userInfo[sourceAddress];
        updateRewardClaimable(user);

        user.contributionBalance += lendingAmount;
        emit LiquidityAdded(sourceAddress, lendingAmount, user.confirmedRewards, user.contributionBalance, user.rewardDebt);
    }

    function withdraw(string calldata sourceChain, string calldata sourceAddress, uint256 withdrawAmount) internal {
        distributeRewards();

        UserInfo storage user = userInfo[sourceAddress];
        updateRewardClaimable(user);

        require(user.contributionBalance >= withdrawAmount, "Insufficient balance");

        try gateway().sendToken(sourceChain, sourceAddress, "USD", withdrawAmount) {
            user.contributionBalance -= withdrawAmount;
            emit LiquidityWithdrawn(sourceAddress, withdrawAmount, user.confirmedRewards, user.contributionBalance, user.rewardDebt);
        } catch {
            revert("Failed to send USD to user");
        }
    }

    function claimReward(string calldata sourceChain, string calldata sourceAddress) internal {
        distributeRewards();

        UserInfo storage user = userInfo[sourceAddress];

        updateRewardClaimable(user);

        require(user.confirmedRewards > 0, "No rewards to claim");

        try gateway().sendToken(sourceChain, sourceAddress, "USD", user.confirmedRewards) {
            emit RewardsClaimed(sourceAddress, user.confirmedRewards, user.confirmedRewards, user.contributionBalance, user.rewardDebt);
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
        // time 10 up as collateral ratio is scaled by 100, and price is scaled by 1e4
        uint256 requiredCollateralXRP = (_borrowAmountUSD * collateralRatioPc * 100) / currentXRPPriceUSDE4;
        require(xrpAmount >= requiredCollateralXRP, "Insufficient collateral");

        uint256 existingLoanId = userLoan[sourceAddress];

        if (existingLoanId != 0) {
            Loan storage existingLoan = loans[existingLoanId];
            updateAmountPayable(existingLoan);

            try gateway().sendToken(sourceChain, sourceAddress, "USD", _borrowAmountUSD) {
                existingLoan.borrowAmountUSD += _borrowAmountUSD;
                existingLoan.collateralAmountXRP += xrpAmount;
                emit LoanUpdated(existingLoanId, sourceAddress, existingLoan.borrowAmountUSD, existingLoan.collateralAmountXRP, existingLoan.amountPayableUSD);
            } catch {
                revert("Failed to send USD to user");
            }

        } else {
            try gateway().sendToken(sourceChain, sourceAddress, "USD", _borrowAmountUSD) {
                loanCounter++;

                // Create Loan entry
                loans[loanCounter] = Loan({
                    borrower: sourceAddress,
                    borrowAmountUSD: _borrowAmountUSD,
                    amountPayableUSD: _borrowAmountUSD,
                    collateralAmountXRP: xrpAmount,
                    lastPayableUpdateTime: block.timestamp,
                    repaidUSD: 0,
                    isLiquidated: false
                });

                userLoan[sourceAddress] = loanCounter;

                emit LoanCreated(loanCounter, sourceAddress, _borrowAmountUSD, xrpAmount, block.timestamp);
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
        uint256 _repayAmountUSD,
        uint256 _loanId
    ) internal {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        Loan storage loan = loans[_loanId];

        require(keccak256(bytes(loan.borrower)) == keccak256(bytes(sourceAddress)), "Not the loan owner");
        require(!loan.isLiquidated, "Loan is already liquidated");
        require(_repayAmountUSD > 0, "Repayment amount must be greater than zero");

        loan.repaidUSD += _repayAmountUSD;
        updateAmountPayable(loan);

        if(_repayAmountUSD >= loan.amountPayableUSD) {
            loan.amountPayableUSD = 0;
            loan.isLiquidated = true;
            try gateway().sendToken(sourceChain, sourceAddress, "XRP", loan.collateralAmountXRP) {
                loan.isLiquidated = true;
                userLoan[sourceAddress] = 0;
                retainedEarning += loan.repaidUSD - loan.borrowAmountUSD;
            } catch {
                revert("Failed to send XRP to user");
            }
        } else {
            loan.amountPayableUSD -= _repayAmountUSD;
        }

        emit LoanRepaid(_loanId, _repayAmountUSD, loan.amountPayableUSD);
        distributeRewards();
    }

    // anyone can call, caller pays more than the total owed amount and gets the collateral
    function liquidateLoan(string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 _repayAmountUSD,
        uint256 _loanId ) internal {
        Loan storage loan = loans[_loanId];
        
        require(!loan.isLiquidated, "Loan already liquidated");

        updatePrice();
        updateAmountPayable(loan);
        uint256 currentCollateralValueUSD = (loan.collateralAmountXRP * currentXRPPriceUSDE4) / 1e4;
        uint256 liquidationThresholdPcValue = (loan.amountPayableUSD * liquidationThresholdPc) / 100;

        // Check if loan is undercollateralized
        require(currentCollateralValueUSD < liquidationThresholdPcValue, "Cannot liquidate yet");
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(_repayAmountUSD >= loan.amountPayableUSD, "Repayment amount must be greater than total owed");
        try gateway().sendToken(sourceChain, sourceAddress, "XRP", loan.collateralAmountXRP) {
            retainedEarning += _repayAmountUSD - loan.amountPayableUSD;
            loan.isLiquidated = true;
            userLoan[loan.borrower] = 0;
            emit LoanLiquidated(_loanId, currentCollateralValueUSD, loan.amountPayableUSD, currentXRPPriceUSDE4);
            distributeRewards();
        } catch {
            revert("Failed to send XRP to user");
        }
    }

    // --- Internal Functions ---
    // if user is not init. contributionBalance is 0, this also serves as a way to initialize user
    function updateRewardClaimable(UserInfo storage user) internal {
        uint256 updatedRewardDebt = (user.contributionBalance * accRewardPerShareE18) / 1e18;
        uint256 pending =updatedRewardDebt - user.rewardDebt;
        user.rewardDebt = updatedRewardDebt;
        user.confirmedRewards += pending;
    }

    function updateAmountPayable(Loan storage loan) internal {
        if (loan.isLiquidated) return;

        uint256 timeElapsed = block.timestamp - loan.lastPayableUpdateTime;
        uint256 daysElapsed = timeElapsed / 1 days;
       
        if (daysElapsed == 0) return;

        uint256 factor = (dailyInterestFactorE18).pow(daysElapsed);
        loan.amountPayableUSD = loan.amountPayableUSD.mul(factor) / 1e18;
        loan.lastPayableUpdateTime = block.timestamp;
    }

    function distributeRewards() internal {
        // Check if enough time has passed since last distribution
        if (block.timestamp < lastRewardTimeStamp + rewardInterval) {
            return;
        }

        if (retainedEarning == 0) return;

        // Update accumulated reward per share
        accRewardPerShareE18 += (retainedEarning * 1e18) / totalLiquidity;
        uint256 rewardAmount = retainedEarning;
        retainedEarning = 0;
        lastRewardTimeStamp = block.timestamp;

        emit RewardsDistributed(rewardAmount,accRewardPerShareE18);
    }

    function updatePrice() internal {
        // Update price no more frequently than once every hour
        if (block.timestamp - lastPriceUpdateTimestamp >= 3600) {
            currentXRPPriceUSDE4 = priceOracle.getPriceXRPUSDT();
            lastPriceUpdateTimestamp = block.timestamp;
        }
    }

    // --- View Functions ---
    function getLoanDetails(uint256 _loanId) public view returns (Loan memory) {
        return loans[_loanId];
    }

    function getUserLoan(string memory _user) public view returns (uint256) {
        return userLoan[_user];
    }

    function getUserInfo(string memory _user) public view returns (UserInfo memory) {
        return userInfo[_user];
    }
}