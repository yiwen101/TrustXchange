// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

contract XrpLending is Ownable, ReentrancyGuard {
    using PRBMathUD60x18 for uint256;

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
    ERC20 public usdToken; // Address of the USD stablecoin ERC20 token
    uint256 public collateralRatio = 150; // Collateral ratio as a percentage (e.g., 150 for 150%)
    uint256 public interestRate = 10; // Annual interest rate in percentage.
    uint256 public liquidationThreshold = 120; // Liquidation threshold as a percentage (e.g. 120%)
    uint256 public currentXRPPriceUSD;

    uint256 public loanCounter;

    // New state variable to store daily rate
    uint256 public dailyRate;

    // Simulate, since the GatewayImpl does not really mint the token
    uint256 public usdOfThisContract = 0;
    uint256 public profit = 0;

    // Reward Tracking Variables
    uint256 public lastRewardBatchId;
    uint256 public lastRewardTimeStamp;
    mapping(uint256 => uint256) public rewardClaimAmounts; // batchId => rewardAmount
    mapping(address => uint256) public lastClaimBatchId; // user => lastClaimedBatchId

    uint256 public totalLiquidity;

    // Mapping to store loan data
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256) public userLoans; // Changed from uint256[] to uint256
    mapping(address => uint256) public liquidators;

    // Mapping to track liquidity contributions and reward debt
    mapping(address => UserInfo) public userInfo;

    // Accumulated Reward Per Share
    uint256 public accRewardPerShare; // Accumulated rewards per share, scaled by 1e18

    uint256 public rewardInterval = 1 days; // Interval between reward distributions

    // --- Events ---
    event LoanCreated(uint256 loanId, address borrower, uint256 borrowAmountUSD, uint256 collateralAmountXRP);
    event LoanUpdated(uint256 loanId, address borrower, uint256 newBorrowAmountUSD, uint256 newCollateralAmountXRP);
    event LoanRepaid(uint256 loanId, uint256 amountRepaid, uint256 repaidPrincipal, uint256 repaidInterest);
    event LoanPartiallyRepaid(uint256 loanId, uint256 amountRepaid, uint256 repaidPrincipal, uint256 repaidInterest);
    event LoanLiquidated(uint256 loanId, address liquidator, uint256 collateralLiquidated);
    event PriceUpdated(uint256 newPrice);
    event InterestAccrued(uint256 loanId, uint256 interest);
    event LiquidatorRoleGranted(address indexed account);
    event RewardsDistributed(uint256 batchId, uint256 rewardAmount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event AccRewardPerShareUpdated(uint256 accRewardPerShare);

    // --- Constructor ---
    constructor(address _usdTokenAddress, uint256 _initialXRPPriceUSD) Ownable(msg.sender) {
        usdToken = ERC20(_usdTokenAddress);
        currentXRPPriceUSD = _initialXRPPriceUSD;
        loanCounter = 0;
        dailyRate = calculateDailyRate(interestRate);
        lastRewardBatchId = 0;
        lastRewardTimeStamp = block.timestamp;
        accRewardPerShare = 0;
    }

    // --- Modifiers ---
    modifier validPrice() {
        require(currentXRPPriceUSD > 0, "Invalid XRP price");
        _;
    }

    modifier onlyLiquidator() {
        require(hasRole(LIQUIDATOR_ROLE, msg.sender), "Caller is not a liquidator");
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

    function setLoanDurationBlocks(uint256 _loanDurationBlocks) external onlyOwner {
        loanDurationBlocks = _loanDurationBlocks;
    }

    // --- User Functions ---
    function lend(uint256 lendingAmount) external nonReentrant {
        updatePool();

        UserInfo storage user = userInfo[msg.sender];

        // Update user pending rewards before changing lendBalance
        if (user.lendBalance > 0) {
            uint256 pending = (user.lendBalance * accRewardPerShare) / 1e18 - user.rewardDebt;
            if (pending > 0) {
                rewardClaimAmounts[lastRewardBatchId] += pending;
            }
        }

        require(usdToken.allowance(msg.sender, address(this)) >= lendingAmount, "Allowance required");
        require(usdToken.balanceOf(msg.sender) >= lendingAmount, "Low balance");

        // Transfer USD tokens from user to contract
        require(usdToken.transferFrom(msg.sender, address(this), lendingAmount), "Transfer failed.");

        // Update user balance and total liquidity
        user.lendBalance += lendingAmount;
        totalLiquidity += lendingAmount;

        // Update reward debt
        user.rewardDebt = (user.lendBalance * accRewardPerShare) / 1e18;

        emit RewardsDistributed(lastRewardBatchId, lendingAmount);
    }

    function withdraw(uint256 withdrawAmount) external nonReentrant {
        updatePool();

        UserInfo storage user = userInfo[msg.sender];

        // Update user pending rewards before changing lendBalance
        if (user.lendBalance > 0) {
            uint256 pending = (user.lendBalance * accRewardPerShare) / 1e18 - user.rewardDebt;
            if (pending > 0) {
                rewardClaimAmounts[lastRewardBatchId] += pending;
            }
        }

        require(user.lendBalance >= withdrawAmount, "Withdrawing more than your balance!");
        require(lastClaimBatchId[msg.sender] >= lastRewardBatchId, "Claim your rewards before withdrawing!");

        // Update user balance and total liquidity
        user.lendBalance -= withdrawAmount;
        totalLiquidity -= withdrawAmount;

        // Transfer USD tokens back to user
        require(usdToken.transfer(msg.sender, withdrawAmount), "Transfer failed.");

        // Update reward debt
        user.rewardDebt = (user.lendBalance * accRewardPerShare) / 1e18;
    }

    function borrow(uint256 _borrowAmountUSD) external payable validPrice {
        uint256 requiredCollateralXRP = (_borrowAmountUSD * collateralRatio) / (100 * currentXRPPriceUSD);
        require(msg.value >= requiredCollateralXRP, "Not enough XRP collateral sent.");

        uint256 existingLoanId = userLoans[msg.sender];

        if (existingLoanId != 0) {
            Loan storage existingLoan = loans[existingLoanId];
            require(!existingLoan.isLiquidated, "Existing loan is liquidated");

            // Update accrued interest before modifying loan
            updateInterest(existingLoanId);

            // Update existing loan amounts
            existingLoan.borrowAmountUSD += _borrowAmountUSD;
            existingLoan.collateralAmountXRP += msg.value;
            existingLoan.lastInterestUpdateTime = block.timestamp;

            emit LoanUpdated(existingLoanId, msg.sender, existingLoan.borrowAmountUSD, existingLoan.collateralAmountXRP);
        } else {
            // Transfer the borrowed USD to user
            require(usdToken.transfer(msg.sender, _borrowAmountUSD), "Transfer failed.");

            loanCounter++;

            // Create Loan entry
            loans[loanCounter] = Loan({
                borrower: msg.sender,
                borrowAmountUSD: _borrowAmountUSD,
                collateralAmountXRP: msg.value,
                startTime: block.timestamp,
                lastInterestUpdateTime: block.timestamp,
                repaidPrincipalUSD: 0,
                repaidInterestUSD: 0,
                accruedInterestUSD: 0,
                isLiquidated: false
            });

            userLoans[msg.sender] = loanCounter;

            emit LoanCreated(loanCounter, msg.sender, _borrowAmountUSD, msg.value);
        }

        // Distribute rewards after borrowing
        distributeRewards();
    }

    function repayLoan(uint256 _loanId, uint256 _repayAmountUSD) external nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.borrower == msg.sender, "Not the loan owner");
        require(!loan.isLiquidated, "Loan is already liquidated");
        require(_repayAmountUSD > 0, "Repayment amount must be greater than zero");

        // Update accrued interest
        updateInterest(_loanId);

        // Calculate outstanding loan including interest
        uint256 totalOwed = loan.borrowAmountUSD + loan.accruedInterestUSD - loan.repaidPrincipalUSD - loan.repaidInterestUSD;
        require(_repayAmountUSD <= totalOwed, "Repayment exceeds amount owed");

        // Ensure enough USD is allowed and available.
        require(usdToken.allowance(msg.sender, address(this)) >= _repayAmountUSD, "Insufficient allowance");
        require(usdToken.balanceOf(msg.sender) >= _repayAmountUSD, "Insufficient balance to repay");

        // Transfer USD to the contract.
        require(usdToken.transferFrom(msg.sender, address(this), _repayAmountUSD), "USD transfer failed");

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
            payable(msg.sender).transfer(loan.collateralAmountXRP);
            // Mark loan as repaid
            loan.isLiquidated = true;
            // Remove loan from userLoans mapping
            userLoans[msg.sender] = 0;
        }

        // Distribute rewards after repayment
        distributeRewards();
    }

    function liquidateLoan(uint256 _loanId) public validPrice onlyOwner nonReentrant {
        Loan storage loan = loans[_loanId];

        require(!loan.isLiquidated, "Loan already liquidated");

        // Update accrued interest
        updateInterest(_loanId);

        uint256 totalOwed = loan.borrowAmountUSD + loan.accruedInterestUSD - loan.repaidPrincipalUSD - loan.repaidInterestUSD;
        uint256 currentCollateralValueUSD = (loan.collateralAmountXRP * currentXRPPriceUSD) / 100;

        uint256 liquidationThresholdValue = (totalOwed * liquidationThreshold) / 100;

        // Check if loan is undercollateralized
        require(currentCollateralValueUSD < liquidationThresholdValue, "Cannot liquidate yet");

        // Transfer the collateral to the liquidator
        payable(msg.sender).transfer(loan.collateralAmountXRP);

        loan.isLiquidated = true;

        emit LoanLiquidated(_loanId, msg.sender, loan.collateralAmountXRP);

        // Distribute rewards after liquidation
        distributeRewards();
    }

    function contributeLiquidity(uint256 usd_amount) public payable nonReentrant {
        require(msg.value == usd_amount, "Invalid amount sent");
        usdOfThisContract += usd_amount;
        liquidators[msg.sender] += usd_amount;

        // Update total liquidity
        totalLiquidity += usd_amount;
    }

    // --- Reward Distribution Functions ---
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

    function updatePool() public {
        distributeRewards();
    }

    function getClaimableRewards(address _user) public view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 accumulated = (user.lendBalance * accRewardPerShare) / 1e18;
        if (accumulated < user.rewardDebt) {
            return 0;
        }
        return accumulated - user.rewardDebt;
    }

    function claimRewards() external nonReentrant {
        updatePool();

        UserInfo storage user = userInfo[msg.sender];
        uint256 pending = (user.lendBalance * accRewardPerShare) / 1e18 - user.rewardDebt;

        require(pending > 0, "No rewards to claim");

        // Update user's reward debt
        user.rewardDebt = (user.lendBalance * accRewardPerShare) / 1e18;

        // Transfer the rewards to the user
        require(usdToken.transfer(msg.sender, pending), "Reward transfer failed");

        emit RewardsClaimed(msg.sender, pending);
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

    // New internal function to calculate daily rate
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
}