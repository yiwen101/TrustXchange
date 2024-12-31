// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XrpLending is Ownable {
    // --- Structs ---
    struct Loan {
        address borrower;
        uint256 borrowAmountUSD; // Loan amount in USD
        uint256 collateralAmountXRP; // Collateral amount in XRP
        uint256 startTime;
         uint256 repaidAmountUSD; // Track how much has been paid back.
        bool isLiquidated;
    }

    // --- State Variables ---
    ERC20 public usdToken; // Address of the USD stablecoin ERC20 token
    uint256 public collateralRatio = 150; // Collateral ratio as a percentage (e.g., 150 for 150%)
    uint256 public interestRate = 10; // Annual interest rate in percentage. Will be calculated on per block basis
    uint256 public liquidationThreshold = 120; // Liquidation threshold as a percentage (e.g. 120%)
    uint256 public loanDurationBlocks = 1000; //  Loan duration in blocks.
    uint256 public currentXRPPriceUSD;

    uint256 public loanCounter;

    // Mapping to store loan data
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;

    // --- Events ---
    event LoanCreated(uint256 loanId, address borrower, uint256 borrowAmountUSD, uint256 collateralAmountXRP);
    event LoanRepaid(uint256 loanId, uint256 amountRepaid);
    event LoanLiquidated(uint256 loanId, address liquidator, uint256 collateralLiquidated);
    event PriceUpdated(uint256 newPrice);


    // --- Constructor ---
    constructor(address _usdTokenAddress, uint256 _initialXRPPriceUSD) Ownable(msg.sender) {
        usdToken = ERC20(_usdTokenAddress);
        currentXRPPriceUSD = _initialXRPPriceUSD;
        loanCounter = 0;
    }

      // --- Modifiers ---
    modifier validPrice() {
         require(currentXRPPriceUSD > 0, "Invalid xrp price");
         _;
    }

    // --- Admin Functions ---
     function setPriceOracle (uint256 newPrice) external onlyOwner {
        currentXRPPriceUSD = newPrice;
        emit PriceUpdated(newPrice);
    }

    function setCollateralRatio(uint256 _collateralRatio) external onlyOwner {
        require(_collateralRatio > 0 && _collateralRatio <= 300 , "Collateral ratio invalid");
        collateralRatio = _collateralRatio;
    }

    function setInterestRate(uint256 _interestRate) external onlyOwner {
        require(_interestRate > 0 && _interestRate <=100 , "Interest rate invalid");
         interestRate = _interestRate;
    }

      function setLiquidationThreshold(uint256 _liquidationThreshold) external onlyOwner {
         require(_liquidationThreshold > 0 && _liquidationThreshold <= 100, "Invalid Liquidation threshold");
        liquidationThreshold = _liquidationThreshold;
    }

    function setLoanDurationBlocks(uint256 _loanDurationBlocks) external onlyOwner {
        loanDurationBlocks = _loanDurationBlocks;
    }


    // --- User Functions ---

    function borrow(uint256 _borrowAmountUSD) external payable validPrice{
        // 1. Calculate required collateral in XRP.
       uint256 requiredCollateralXRP = (_borrowAmountUSD * collateralRatio) / (100 * currentXRPPriceUSD);
        // 2. Ensure enough XRP collateral was sent.
        require(msg.value >= requiredCollateralXRP, "Not enough XRP collateral sent.");

       // 3. Transfer the borrowed USD to user
        require(usdToken.transfer(msg.sender, _borrowAmountUSD), "Transfer failed.");

        loanCounter++;

        // 4. Create Loan entry
        loans[loanCounter] = Loan({
            borrower: msg.sender,
            borrowAmountUSD: _borrowAmountUSD,
            collateralAmountXRP: msg.value,
            startTime: block.timestamp,
             repaidAmountUSD: 0,
            isLiquidated: false
        });

         userLoans[msg.sender].push(loanCounter);


        emit LoanCreated(loanCounter, msg.sender, _borrowAmountUSD, msg.value);
    }


    function repayLoan(uint256 _loanId, uint256 _repayAmountUSD) external {
       Loan storage loan = loans[_loanId];

       require(loan.borrower == msg.sender, "You are not the owner of this loan");
       require(!loan.isLiquidated, "Loan is already closed");
         require(_repayAmountUSD > 0, "Repayment amount should be greater then zero");
           // Calculate outstanding loan balance
        uint256 outstandingLoan = loan.borrowAmountUSD - loan.repaidAmountUSD;

       require(_repayAmountUSD <= outstandingLoan, "Repayment amount exceeds outstanding loan.");

        // 1. Ensure enough USD is sent.
       require(usdToken.allowance(msg.sender, address(this)) >= _repayAmountUSD, "Allowance required");
       require(usdToken.balanceOf(msg.sender) >= _repayAmountUSD, "Not enough balance to repay");


       // 2. Transfer USD to the contract.
        require(usdToken.transferFrom(msg.sender, address(this), _repayAmountUSD), "USD transfer failed");



        // 3. Update the repaid amount.
        loan.repaidAmountUSD += _repayAmountUSD;
           // check if loan is completely paid, then send back collateral.
         if(loan.repaidAmountUSD == loan.borrowAmountUSD){
           // 4. Send the collateral back to user.
            payable(msg.sender).transfer(loan.collateralAmountXRP);
            // 5. Mark loan as repaid.
             loan.isLiquidated = true;
         }

        emit LoanRepaid(_loanId, _repayAmountUSD);

    }

      function liquidateLoan(uint256 _loanId) public validPrice{
        Loan storage loan = loans[_loanId];

        require(!loan.isLiquidated, "Loan already liquidated");
        uint256 outstandingLoan = loan.borrowAmountUSD - loan.repaidAmountUSD;

        uint256 currentCollateralValueUSD = (loan.collateralAmountXRP * currentXRPPriceUSD) / 100; // Calculate the collateral's current value in USD
        uint256 liquidationThresholdValue = (outstandingLoan * liquidationThreshold) / 100;
        uint256 blockSinceStart = block.timestamp - loan.startTime;

         // Check if the loan has expired.
         bool loanExpired = blockSinceStart > loanDurationBlocks;

        // Check if loan is undercollateralized or if loan has expired
        require(currentCollateralValueUSD < liquidationThresholdValue || loanExpired, "Loan cannot be liquidated yet.");

         // Transfer the collateral to the liquidator.
        payable(msg.sender).transfer(loan.collateralAmountXRP);

        loan.isLiquidated = true;

        emit LoanLiquidated(_loanId, msg.sender, loan.collateralAmountXRP);

    }


    // --- View Functions ---

     function getLoanDetails(uint256 _loanId) public view returns (Loan memory) {
        return loans[_loanId];
    }
      function getUserLoans(address _user) public view returns (uint256[] memory) {
        return userLoans[_user];
    }
}