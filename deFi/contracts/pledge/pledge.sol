// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

contract XrpLending is Ownable {
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

    // --- State Variables ---
    ERC20 public usdToken; // Address of the USD stablecoin ERC20 token
    uint256 public collateralRatio = 150; // Collateral ratio as a percentage (e.g., 150 for 150%)
    uint256 public interestRate = 10; // Annual interest rate in percentage.
    uint256 public liquidationThreshold = 120; // Liquidation threshold as a percentage (e.g. 120%)
    uint256 public currentXRPPriceUSD;

    uint256 public loanCounter;

    // New state variable to store daily rate
    uint256 public dailyRate;

    // Simulate, since the GatewayImpl do not realy mint the token
    uint256 public usdOfThisContract = 0;
    uint256 public profit = 0;

    // Mapping to store loan data
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256) public userLoans; // Changed from uint256[] to uint256
    mapping(address => uint256) public liquidators;

    // --- Events ---
    event LoanCreated(uint256 loanId, address borrower, uint256 borrowAmountUSD, uint256 collateralAmountXRP);
    event LoanUpdated(uint256 loanId, address borrower, uint256 newBorrowAmountUSD, uint256 newCollateralAmountXRP);
    event LoanRepaid(uint256 loanId, uint256 amountRepaid, uint256 repaidPrincipal, uint256 repaidInterest);
    event LoanPartiallyRepaid(uint256 loanId, uint256 amountRepaid, uint256 repaidPrincipal, uint256 repaidInterest);
    event LoanLiquidated(uint256 loanId, address liquidator, uint256 collateralLiquidated);
    event PriceUpdated(uint256 newPrice);
    event InterestAccrued(uint256 loanId, uint256 interest);
    event LiquidatorRoleGranted(address indexed account);

    // --- Constructor ---
    constructor(address _usdTokenAddress, uint256 _initialXRPPriceUSD) Ownable(msg.sender) {
        usdToken = ERC20(_usdTokenAddress);
        currentXRPPriceUSD = _initialXRPPriceUSD;
        loanCounter = 0;
        dailyRate = calculateDailyRate(interestRate);

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
    }

    function repayLoan(uint256 _loanId, uint256 _repayAmountUSD) external {
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
    }

    function liquidateLoan(uint256 _loanId) public validPrice onlyOwner{
        Loan storage loan = loans[_loanId];

        require(!loan.isLiquidated, "Loan already liquidated");

        // Update accrued interest
        updateInterest(_loanId);

        uint256 totalOwed = loan.borrowAmountUSD + loan.accruedInterestUSD - loan.repaidPrincipalUSD - loan.repaidInterestUSD;
        uint256 currentCollateralValueUSD = (loan.collateralAmountXRP * currentXRPPriceUSD) / 100;

        uint256 liquidationThresholdValue = (totalOwed * liquidationThreshold) / 100;

        // Check if loan is undercollateralized or if loan has expired
        require(currentCollateralValueUSD < liquidationThresholdValue );

        // Transfer the collateral to the liquidator
        // wrong
        payable(msg.sender).transfer(loan.collateralAmountXRP);

        loan.isLiquidated = true;

        emit LoanLiquidated(_loanId, msg.sender, loan.collateralAmountXRP);
    }

    function contributeLiquidity(uint256 usd_amount) public payable {
        require(msg.value == usd_amount, "Invalid amount sent");
        usdOfThisContract += usd_amount;
        liquidators[msg.sender] += usd_amount;
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