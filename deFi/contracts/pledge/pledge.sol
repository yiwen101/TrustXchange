// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/access/Ownable.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";
import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';

contract XrpLending is Ownable, AxelarExecutableWithToken {
    using PRBMathUD60x18 for uint256;

    bytes32 internal constant SELECTOR_LEND = keccak256("lend");
    bytes32 internal constant SELECTOR_WITHDRAW = keccak256("withdraw");
    bytes32 internal constant SELECTOR_CLAIM_REWARD = keccak256("claimReward");
    bytes32 internal constant SELECTOR_BORROW = keccak256("borrow");
    bytes32 internal constant SELECTOR_REPAY_LOAN = keccak256("repayLoan");
    bytes32 internal constant SELECTOR_LIQUIDATE_LOAN = keccak256("liquidateLoan");

    // --- Structs ---
    struct Loan {
        address borrower;
        uint256 borrowAmountUSD; // Loan amount in USD
        uint256 collateralAmountXRP; // Collateral amount in XRP
        uint256 startTime;
        uint256 lastInterestUpdateTime;
        uint256 repaidPrincipalUSD; // Track principal repaid
        uint256 repaidInterestUSD;  // Track interest repaid
        uint256 accruedInterestUSD;
        bool isLiquidated;
    }

    struct UserInfo {
        uint256 lendBalance;
        uint256 rewardDebt;
    }

    // --- State Variables ---
    uint256 public collateralRatio = 150; // Collateral ratio as a percentage (e.g., 150 for 150%)
    uint256 public interestRate = 10; // Annual interest rate in percentage.
    uint256 public liquidationThreshold = 120; // Liquidation threshold as a percentage (e.g. 120%)
    uint256 public currentXRPPriceUSD;

    uint256 public loanCounter;

    // New state variable to store daily rate
    uint256 public dailyRate;

    // Simulate, since the GatewayImpl does not really mint the token
    uint256 public profit = 0;

    // Reward Tracking Variables
    uint256 public lastRewardBatchId;
    uint256 public lastRewardTimeStamp;
    mapping(uint256 => uint256) public rewardClaimAmounts; // batchId => rewardAmount
    mapping(string => uint256) public lastClaimBatchId; // user => lastClaimedBatchId

    uint256 public totalLiquidity;

    // Mapping to store loan data
    mapping(uint256 => Loan) public loans;
    mapping(string => uint256) public userLoans;
    mapping(string => uint256) public liquidators;

    // Mapping to track liquidity contributions and reward debt
    mapping(string => UserInfo) public userInfo;

    // Accumulated Reward Per Share
    uint256 public accRewardPerShare; // Accumulated rewards per share, scaled by 1e18

    uint256 public rewardInterval = 1 days; // Interval between reward distributions

    // --- Events ---
    event LoanCreated(uint256 loanId, string borrower, uint256 borrowAmountUSD, uint256 collateralAmountXRP);
    event LoanUpdated(uint256 loanId, string borrower, uint256 newBorrowAmountUSD, uint256 newCollateralAmountXRP);
    event LoanRepaid(uint256 loanId, uint256 amountRepaid, uint256 repaidPrincipal, uint256 repaidInterest);
    event LoanPartiallyRepaid(uint256 loanId, uint256 amountRepaid, uint256 repaidPrincipal, uint256 repaidInterest);
    event LoanLiquidated(uint256 loanId, string liquidator, uint256 collateralLiquidated);
    event PriceUpdated(uint256 newPrice);
    event InterestAccrued(uint256 loanId, uint256 interest);
    event RewardsDistributed(uint256 batchId, uint256 rewardAmount);
    event RewardsClaimed(string indexed user, uint256 amount);
    event AccRewardPerShareUpdated(uint256 accRewardPerShare);

    // --- Constructor ---
    constructor(address gateway_, uint256 _initialXRPPriceUSD) Ownable() AxelarExecutableWithToken(gateway_) {
        currentXRPPriceUSD = _initialXRPPriceUSD;
        loanCounter = 0;
        dailyRate = calculateDailyRate(interestRate);
        lastRewardBatchId = 0;
        lastRewardTimeStamp = block.timestamp;
        accRewardPerShare = 0;
    }

    // --- Modifiers ---
    modifier onlySelf() {
        require(msg.sender == address(this), "Caller is not the contract itself");
        _;
    }

    // --- Admin Functions ---
    function setPriceOracle(uint256 newPrice) external onlyOwner {
        currentXRPPriceUSD = newPrice;
        emit PriceUpdated(newPrice);
    }

    function setCollateralRatio(uint256 _collateralRatio) external onlyOwner {
        require(_collateralRatio > 0 && _collateralRatio <= 300, "Collateral ratio invalid");
        collateralRatio = _collateralRatio;
    }

    function setInterestRate(uint256 _interestRate) external onlyOwner {
        require(_interestRate > 0 && _interestRate <= 100, "Interest rate invalid");
        interestRate = _interestRate;
        dailyRate = calculateDailyRate(_interestRate); // Update dailyRate when interestRate changes
    }

    function setLiquidationThreshold(uint256 _liquidationThreshold) external onlyOwner {
        require(_liquidationThreshold > 0 && _liquidationThreshold <= 100, "Invalid liquidation threshold");
        liquidationThreshold = _liquidationThreshold;
    }

        // --- Gateway Functions ---

    function _execute(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        string command;
        bytes memory params;
       (command,params)= abi.decode(payload, (string,bytes));
        bytes32 commandHash = keccak256(abi.encodePacked(command));
        if (commandHash == SELECTOR_CLAIM_REWARD) {
            claimReward(sourceChain, sourceAddress);
        } else if (commandHash == SELECTOR_WITHDRAW) {
            (uint256 withdrawAmount) = abi.decode(params, (uint256));
            withdraw(sourceChain, sourceAddress, withdrawAmount);
        } else if (commandHash == SELECTOR_LIQUIDATE_LOAN) {
            (uint256 loanId) = abi.decode(params, (uint256));
            liquidateLoan(loanId);
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
        if (amount == 0) {
            revert("Invalid amount");
        }
        string command;
        bytes memory _params;
        (command,_params)= abi.decode(payload, (string,bytes));
        bytes32 commandHash = keccak256(abi.encodePacked(command));
        if (commandHash == SELECTOR_LEND) {
            lend(sourceAddress, tokenSymbol, amount);
        } else if (commandHash == SELECTOR_BORROW) {
            uint256 borrowAmountUSD = abi.decode(_params, (uint256));
            borrow(sourceChain,sourceAddress,tokenSymbol,amount, borrowAmountUSD);
        } else if (commandHash == SELECTOR_REPAY_LOAN) {
            uint256 loanId = abi.decode(_params, uint256);
            repayLoan(sourceChain, sourceAddress, tokenSymbol, amount, loanId);
        } else {
            revert("Invalid command");
        }
    }
    
    /******************\
    |* Self Functions *|
    \******************/

    // --- User Functions ---
    function lend(string sourceAddress,string tokenSymbol, uint256 lendingAmount) internal {
        require(tokenSymbol == "USD", "Invalid token symbol");
        distributeRewards();

        UserInfo storage user = userInfo[sourceAddress];

        // Update user pending rewards before changing lendBalance
        if (user.lendBalance > 0) {
            uint256 pending = (user.lendBalance * accRewardPerShare) / 1e18 - user.rewardDebt;
            if (pending > 0) {
                rewardClaimAmounts[lastRewardBatchId] += pending;
            }
        }

        // Update user balance and total liquidity
        user.lendBalance += lendingAmount;
        totalLiquidity += lendingAmount;

        // Update reward debt
        user.rewardDebt = (user.lendBalance * accRewardPerShare) / 1e18;

        emit RewardsDistributed(lastRewardBatchId, lendingAmount);
    }

    function withdraw(string calldata sourceChain,string calldata sourceAddress,uint256 withdrawAmount) internal {
        distributeRewards();

        UserInfo storage user = userInfo[sourceAddress];

        // Update user pending rewards before changing lendBalance
        if (user.lendBalance > 0) {
            uint256 pending = (user.lendBalance * accRewardPerShare) / 1e18 - user.rewardDebt;
            if (pending > 0) {
                rewardClaimAmounts[lastRewardBatchId] += pending;
            }
        }

        require(lastClaimBatchId[sourceAddress] >= lastRewardBatchId, "Claim your rewards before withdrawing!");

        // Update user balance and total liquidity
        user.lendBalance -= withdrawAmount;
        totalLiquidity -= withdrawAmount;

        // Transfer USD tokens back to user
        gateway().sendToken(sourceChain, sourceAddress, "usd", withdrawAmount);

        // Update reward debt
        user.rewardDebt = (user.lendBalance * accRewardPerShare) / 1e18;
    }

    function claimReward(string calldata sourceChain,string calldata sourceAddress) internal {
        distributeRewards();

        UserInfo storage user = userInfo[sourceAddress];
        uint256 pending = (user.lendBalance * accRewardPerShare) / 1e18 - user.rewardDebt;

        require(pending > 0, "No rewards to claim");

        // Update user's reward debt
        user.rewardDebt = (user.lendBalance * accRewardPerShare) / 1e18;

        // Transfer the rewards to the user
        gateway().sendToken(sourceChain, sourceAddress, "USD", pending);

        emit RewardsClaimed(sourceAddress, pending);
    }

    function borrow(string calldata sourceChain,string calldata sourceAddress,string tokenSymbol,
        uint256 xrpAmount, uint256 _borrowAmountUSD) internal {
        require(tokenSymbol == "XRP", "Invalid token symbol");
        uint256 requiredCollateralXRP = (_borrowAmountUSD * collateralRatio) / (100 * currentXRPPriceUSD);
        require(xrpAmount >= requiredCollateralXRP, "Insufficient collateral");

        uint256 existingLoanId = userLoans[sourceAddress];

        if (existingLoanId != 0) {
            Loan storage existingLoan = loans[existingLoanId];
            require(!existingLoan.isLiquidated, "Existing loan is liquidated");

            // Update accrued interest before modifying loan
            updateInterest(existingLoanId);
            gateway().sendToken(sourceChain, sourceAddress, "USD", _borrowAmountUSD);
            // Update existing loan amounts
            existingLoan.borrowAmountUSD += _borrowAmountUSD;
            existingLoan.collateralAmountXRP += xrpAmount;
            existingLoan.lastInterestUpdateTime = block.timestamp;

            

            emit LoanUpdated(existingLoanId, sourceAddress, existingLoan.borrowAmountUSD, existingLoan.collateralAmountXRP);
        } else {
            // Transfer the borrowed USD to user
            gateway().sendToken(sourceChain, sourceAddress, "USD", _borrowAmountUSD);

            loanCounter++;

            // Create Loan entry
            loans[loanCounter] = Loan({
                borrower: sourceAddress,
                borrowAmountUSD: _borrowAmountUSD,
                collateralAmountXRP: xrpAmount,
                startTime: block.timestamp,
                lastInterestUpdateTime: block.timestamp,
                repaidPrincipalUSD: 0,
                repaidInterestUSD: 0,
                accruedInterestUSD: 0,
                isLiquidated: false
            });

            userLoans[sourceAddress] = loanCounter;

            emit LoanCreated(loanCounter, sourceAddress, _borrowAmountUSD, xrpAmount);
        }

        distributeRewards();
    }

    function repayLoan(string sourceChain, string sourceAddress, string tokenSymbol, uint256 _repayAmountUSD, uint256 _loanId) internal {
        require(tokenSymbol == "USD", "Invalid token symbol");
        Loan storage loan = loans[_loanId];

        require(loan.borrower == sourceAddress, "Not the loan owner");
        require(!loan.isLiquidated, "Loan is already liquidated");
        require(_repayAmountUSD > 0, "Repayment amount must be greater than zero");

        // Update accrued interest
        updateInterest(_loanId);

        // Calculate outstanding loan including interest
        uint256 totalOwed = loan.borrowAmountUSD + loan.accruedInterestUSD - loan.repaidPrincipalUSD - loan.repaidInterestUSD;
        require(_repayAmountUSD <= totalOwed, "Repayment exceeds amount owed");

        // Ensure enough USD is allowed and available.
        uint256 repaymentToInterest = 0;
        uint256 repaymentToPrincipal = 0;

        if (loan.accruedInterestUSD > loan.repaidInterestUSD) {
            uint256 interestOwed = loan.accruedInterestUSD - loan.repaidInterestUSD;
            if (_repayAmountUSD >= interestOwed) {
                repaymentToInterest = interestOwed;
                repaymentToPrincipal = _repayAmountUSD - interestOwed;
            } else {
                repaymentToInterest = _repayAmountUSD;
            }
        } else {
            repaymentToPrincipal = _repayAmountUSD;
        }

        // Update the repaid amounts.
        loan.repaidInterestUSD += repaymentToInterest;
        loan.repaidPrincipalUSD += repaymentToPrincipal;

        if (repaymentToInterest > 0 && repaymentToPrincipal > 0) {
            emit LoanRepaid(_loanId, _repayAmountUSD, repaymentToPrincipal, repaymentToInterest);
        } else {
            emit LoanPartiallyRepaid(_loanId, _repayAmountUSD, repaymentToPrincipal, repaymentToInterest);
        }

        // Check if loan is completely paid, then send back collateral.
        if (
            loan.repaidPrincipalUSD >= loan.borrowAmountUSD &&
            loan.repaidInterestUSD >= loan.accruedInterestUSD
        ) {
            // Transfer collateral back to user
            gateway().sendToken(sourceChain, sourceAddress, "XRP", loan.collateralAmountXRP);
            // Mark loan as repaid
            loan.isLiquidated = true;
            // Remove loan from userLoans mapping
            userLoans[sourceAddress] = 0;
        }

        // Distribute rewards after repayment
        distributeRewards();
    }

    function liquidateLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];

        require(!loan.isLiquidated, "Loan already liquidated");

        // Update accrued interest
        updateInterest(_loanId);

        uint256 totalOwed = loan.borrowAmountUSD + loan.accruedInterestUSD - loan.repaidPrincipalUSD - loan.repaidInterestUSD;
        uint256 currentCollateralValueUSD = (loan.collateralAmountXRP * currentXRPPriceUSD);

        uint256 liquidationThresholdValue = (totalOwed * liquidationThreshold) / 100;

        // Check if loan is undercollateralized
        require(currentCollateralValueUSD < liquidationThresholdValue, "Cannot liquidate yet");

        // pretend is traded via AMM
        profit += (currentCollateralValueUSD - totalOwed);
        loan.isLiquidated = true;

        emit LoanLiquidated(_loanId, msg.sender, loan.collateralAmountXRP);

        // Distribute rewards after liquidation
        distributeRewards();
    }

    // --- Internal Functions ---
    function updateInterest(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        if (loan.isLiquidated) return;

        uint256 timeElapsed = block.timestamp - loan.lastInterestUpdateTime;
        if (timeElapsed < 1 days) return; // Update interest once per day

        uint256 daysElapsed = timeElapsed / 1 days;
        if (daysElapsed == 0) return;

        // Use the stored daily rate
        uint256 interestAccrued = calculateInterestAfterDaysInternal(_loanId, daysElapsed);

        loan.accruedInterestUSD += interestAccrued;
        loan.lastInterestUpdateTime += daysElapsed * 1 days;

        emit InterestAccrued(_loanId, interestAccrued);
    }

    function calculateInterestAfterDaysInternal(uint256 _loanId, uint256 _days) internal view returns (uint256) {
        Loan memory loan = loans[_loanId];
        if (loan.isLiquidated) {
            return 0;
        }

        uint256 principal = loan.borrowAmountUSD + loan.accruedInterestUSD - loan.repaidPrincipalUSD - loan.repaidInterestUSD;

        uint256 factor = (1e18 + dailyRate).pow(_days);
        uint256 amountAfterInterest = principal.mul(factor) / 1e18;
        uint256 estimatedInterest = amountAfterInterest - principal;

        return estimatedInterest;
    }

    function distributeRewards() internal {
        // Check if enough time has passed since last distribution
        if (block.timestamp < lastRewardTimeStamp + rewardInterval) {
            return;
        }

        if (profit == 0) return;

        // Example: Distribute 1% of the profit as rewards
        uint256 rewardAmount = profit / 100;
        if (rewardAmount == 0) return;

        // Update accumulated reward per share
        accRewardPerShare += (rewardAmount * 1e18) / totalLiquidity;

        // Reset profit
        profit -= rewardAmount;

        lastRewardBatchId += 1;
        rewardClaimAmounts[lastRewardBatchId] = rewardAmount;
        lastRewardTimeStamp = block.timestamp;

        emit RewardsDistributed(lastRewardBatchId, rewardAmount);
        emit AccRewardPerShareUpdated(accRewardPerShare);
    }
   
    function calculateDailyRate(uint256 _annualRate) internal pure returns (uint256) {
        uint256 annualRateFixed = (_annualRate * 1e18) / 100;
        return annualRateFixed / 365;
    }

    // --- View Functions ---
    function getLoanDetails(uint256 _loanId) public view returns (Loan memory) {
        return loans[_loanId];
    }

    function getUserLoan(address _user) public view returns (uint256) {
        return userLoans[_user];
    }

    function calculateInterestAfterDays(uint256 _loanId, uint256 _days) external view returns (uint256) {
        return calculateInterestAfterDaysInternal(_loanId, _days);
    }

    function getClaimableRewards(address _user) public view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 accumulated = (user.lendBalance * accRewardPerShare) / 1e18;
        if (accumulated < user.rewardDebt) {
            return 0;
        }
        return accumulated - user.rewardDebt;
    }
}