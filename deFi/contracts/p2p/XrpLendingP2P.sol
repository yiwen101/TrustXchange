// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "prb-math/contracts/PRBMathUD60x18.sol";
import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';


interface PriceOracle {
    function getPriceXRPUSDT() external view returns (uint256);
}

contract XrpLendingP2PV2 is AxelarExecutableWithToken {
    using PRBMathUD60x18 for uint256;
    // --- Constants ---

    // execute with token selectors
    bytes32 public constant SELECTOR_LENDING_REQUEST = keccak256("createLendingRequest");
    bytes32 public constant SELECTOR_BORROWING_REQUEST = keccak256("createBorrowingRequest");
    bytes32 public constant SELECTOR_ACCEPT_LENDING_REQUEST = keccak256("acceptLendingRequest");
    bytes32 public constant SELECTOR_ACCEPT_BORROWING_REQUEST = keccak256("acceptBorrowingRequest");
    bytes32 public constant SELECTOR_REPAY_LOAN = keccak256("repayLoan");

    // execute selectors
    bytes32 public constant SELECTOR_CANCEL_LENDING_REQUEST = keccak256("cancelLendingRequest");
    bytes32 public constant SELECTOR_CANCEL_BORROWING_REQUEST = keccak256("cancelBorrowingRequest");
    bytes32 public constant SELECTOR_LIQUIDATE_LOAN = keccak256("liquidateLoan");

    string public constant supportedSourceChain = "XRPL_testnet";
    bytes32 public constant SUPPORTED_SOURCE_CHAIN_HASH = keccak256(bytes(supportedSourceChain));

    // --- Structs ---
    struct Loan {
        string lender;           
        string borrower;         
        uint256 amountBorrowedUSD;   
        uint256 amountPayableToLender;
        uint256 amountPayableToPlatform;
        uint256 amountPaidUSD;  
        uint256 collateralAmountXRP; 
        uint256 repayBy;         
        uint256 liquidationThreshold;  
        bool isLiquidated;        
    }

    struct LendingRequest {
        string lender;           
        uint256 amountToLendUSD;          
        uint256 amountLendedUSD;          
        uint256 minCollateralRatio; 
        uint256 liquidationThreshold; 
        uint256 desiredInterestRate; 
        uint256 paymentDuration;    
        uint256 minimalPartialFill; 
        bool canceled;              
    }

    struct BorrowingRequest {
        string borrower;          
        uint256 amountToBorrowUSD;          
        uint256 amountBorrowedUSD;          
        uint256 initialCollateralAmountXRP;
        uint256 existingCollateralAmountXRP; 
        uint256 maxCollateralRatio;  
        uint256 liquidationThreshold; 
        uint256 desiredInterestRate;       
        uint256 paymentDuration;    
        uint256 minimalPartialFill; 
        bool canceled;
    }

    // --- State Variables ---
    PriceOracle priceOracle;
    // eg: currentXRPPriceUSD = 21164 means 1 XRP = 2.1164 USD
    // xrp and usd amount are assumed integer values for simplicity
    uint256 public currentXRPPriceUSD; 
    uint256 public lastPriceUpdateTimestamp;   
    uint256 public loanCounter;       
    mapping(uint256 => Loan) public loans;            
    mapping(uint256 => LendingRequest) public lendingRequests; 
    mapping(uint256 => BorrowingRequest) public borrowingRequests; 
    mapping(string => uint256[]) public userLoans;  
    mapping(string => uint256[]) public userLendingRequests; 
    mapping(string => uint256[]) public userBorrowingRequests; 
    uint256 public requestCounter;    

    uint256 public constant PLATFORM_FEE_PERCENT = 5;

    address public immutable oracleUpdater;

    // no indexed as https://github.com/hyperledger-web3j/web3j/issues/1109
    // --- Events ---
    event LoanCreated(
        uint256 loanId, 
        string lender, 
        string borrower, 
        uint256 amountBorrowedUSD, 
        uint256 collateralAmountXRP,
        uint256 amountPayableToLender,
        uint256 amountPayableToPlatform,
        uint256 repayBy,
        uint256 liquidationThreshold
    );
    event LoanUpdated(
        uint256 loanId, 
        string  borrower, 
        uint256 newAmountBorrowedUSD, 
        uint256 newCollateralAmountXRP,
        uint256 newAmountPayableToLender
    );
    event LoanRepaid(uint256 loanId, uint256 amountRepaid, uint256 totalPaid);
    event LoanLiquidated(uint256 loanId, string liquidator, uint256 collateralLiquidated);
    event PriceUpdated(uint256 newPrice);
    event LendingRequestCreated(
        uint256 requestId, 
        string lender, 
        uint256 amountToLendUSD,
        uint256 minCollateralRatio,
        uint256 liquidationThreshold,
        uint256 desiredInterestRate, 
        uint256 paymentDuration,
        uint256 minimalPartialFill
    );
    event BorrowingRequestCreated(
        uint256 requestId, 
        string borrower, 
        uint256 amountToBorrowUSD,
        uint256 collateralAmountXRP, 
        uint256 maxCollateralRatio, 
        uint256 liquidationThreshold,
        uint256 desiredInterestRate,
        uint256 paymentDuration,
        uint256 minimalPartialFill
    );
    event LendingRequestCanceled(uint256 requestId, string canceller);
    event BorrowingRequestCanceled(uint256 requestId, string canceller);
    event LendingRequestAutoCanceled(uint256 requestId);
    event BorrowingRequestAutoCanceled(uint256 requestId);
    event RequestFilled(uint256 requestId, uint256 amountFilled);

    // --- Constructor ---
    constructor(address gateway_, address priceOracle_) 
        AxelarExecutableWithToken(gateway_) 
    {
        priceOracle = PriceOracle(priceOracle_);
        loanCounter = 0;
        requestCounter = 0;
        oracleUpdater = msg.sender;
    }

    // --- Modifiers ---
    modifier onlySelf() {
        require(msg.sender == address(this), "Caller is not the contract itself");
        _;
    }

    modifier onlyOracleUpdater() {
        require(msg.sender == oracleUpdater, "Caller is not the oracle updater");
        _;
    }

    // --- Helper Functions ---
    /**
     * @dev Removes a loan ID from a user's loan array.
     */
    function _removeLoanFromUser(string memory _borrower, uint256 _loanId) internal {
        uint256[] storage loansArray = userLoans[_borrower];
        for (uint256 i = 0; i < loansArray.length; i++) {
            if (loansArray[i] == _loanId) {
                loansArray[i] = loansArray[loansArray.length - 1];
                loansArray.pop();
                break;
            }
        }
    }

    // --- Admin Functions ---
    function setPriceOracle(uint256 newPrice) external onlyOracleUpdater {
        currentXRPPriceUSD = newPrice;
        emit PriceUpdated(newPrice);
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

        if(commandHash == SELECTOR_CANCEL_LENDING_REQUEST) {
            (uint256 requestId) = abi.decode(params, (uint256));
            cancelLendingRequest(sourceChain, sourceAddress, requestId);
        } else if(commandHash == SELECTOR_CANCEL_BORROWING_REQUEST) {
            (uint256 requestId) = abi.decode(params, (uint256));
            cancelBorrowingRequest(sourceChain, sourceAddress, requestId);
        } else if(commandHash == SELECTOR_LIQUIDATE_LOAN) {
            (uint256 loanId) = abi.decode(params, (uint256));
            liquidateLoan(loanId, sourceAddress);
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

        if(commandHash == SELECTOR_LENDING_REQUEST) {
            (uint256 _minCollateralRatio,
            uint256 _liquidationThreshold, 
            uint256 _desiredInterestRate, 
            uint256 _paymentDuration,
            uint256 _minimalPartialFill) = abi.decode(params, (uint256, uint256, uint256, uint256, uint256));
            createLendingRequest(sourceChain, sourceAddress, tokenSymbol, amount,
                _minCollateralRatio, _liquidationThreshold, _desiredInterestRate, _paymentDuration, _minimalPartialFill);
        } else if (commandHash == SELECTOR_BORROWING_REQUEST) {
            (uint256 _amountToBorrowUSD, 
            uint256 _maxCollateralRatio, 
            uint256 _liquidationThreshold, 
            uint256 _desiredInterestRate, 
            uint256 _paymentDuration,
            uint256 _minimalPartialFill) = abi.decode(params, (uint256, uint256, uint256, uint256, uint256, uint256));
            createBorrowingRequest(sourceChain, sourceAddress, tokenSymbol, amount,
                _amountToBorrowUSD, _maxCollateralRatio, _liquidationThreshold, _desiredInterestRate, _paymentDuration, _minimalPartialFill);
        } else if (commandHash == SELECTOR_ACCEPT_LENDING_REQUEST) {
            (uint256 _requestId, uint256 _borrowAmountUSD) = abi.decode(params, (uint256, uint256));
            acceptLendingRequest(sourceChain, sourceAddress, tokenSymbol, amount,
                _requestId, _borrowAmountUSD);
        } else if (commandHash == SELECTOR_ACCEPT_BORROWING_REQUEST) {
            (uint256 _requestId, uint256 _collateralAmountXRP) = abi.decode(params, (uint256, uint256));
            acceptBorrowingRequest(sourceChain, sourceAddress, tokenSymbol, amount,
                _requestId, _collateralAmountXRP);
        } else if (commandHash == SELECTOR_REPAY_LOAN) {
            (uint256 _repayAmountUSD, uint256 _loanId) = abi.decode(params, (uint256, uint256));
            repayLoan(sourceChain, sourceAddress, tokenSymbol, amount, _loanId);
        } else {
            gateway().sendToken(sourceChain, sourceAddress, tokenSymbol, amount-1);
            revert("Invalid command");
        }
        
    }

    /******************\
    |* Internal Functions *|
    \******************/

    // --- User Functions ---
    function createLendingRequest(
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 _amountToLendUSD,
        uint256 _minCollateralRatio,
        uint256 _liquidationThreshold, 
        uint256 _desiredInterestRate, 
        uint256 _paymentDuration,
        uint256 _minimalPartialFill
    ) internal {
        string memory lender = sourceAddress;
        
        requestCounter++;
        lendingRequests[requestCounter] = LendingRequest({
            lender: lender,
            amountToLendUSD: _amountToLendUSD,
            amountLendedUSD: 0,
            minCollateralRatio: _minCollateralRatio,
            liquidationThreshold: _liquidationThreshold,
            desiredInterestRate: _desiredInterestRate,
            paymentDuration: _paymentDuration,
            minimalPartialFill: _minimalPartialFill,
            canceled: false
        });
        userLendingRequests[lender].push(requestCounter);
        emit LendingRequestCreated(
            requestCounter, 
            lender, 
            _amountToLendUSD, 
            _minCollateralRatio,
            _liquidationThreshold, 
            _desiredInterestRate, 
            _paymentDuration,
            _minimalPartialFill
        );
    }

    function createBorrowingRequest(
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 _collateralAmountXRP,
        uint256 _amountToBorrowUSD, 
        uint256 _maxCollateralRatio, 
        uint256 _liquidationThreshold, 
        uint256 _desiredInterestRate, 
        uint256 _paymentDuration,
        uint256 _minimalPartialFill
    ) internal {
        string memory borrower = sourceAddress;
        
        requestCounter++;
        borrowingRequests[requestCounter] = BorrowingRequest({
            borrower: borrower,
            amountToBorrowUSD: _amountToBorrowUSD,
            amountBorrowedUSD: 0,
            initialCollateralAmountXRP: _collateralAmountXRP,
            existingCollateralAmountXRP: _collateralAmountXRP,
            maxCollateralRatio: _maxCollateralRatio,
            liquidationThreshold: _liquidationThreshold,
            desiredInterestRate: _desiredInterestRate,
            paymentDuration: _paymentDuration,
            minimalPartialFill: _minimalPartialFill,
            canceled: false
        });
        userBorrowingRequests[borrower].push(requestCounter);
        emit BorrowingRequestCreated(
            requestCounter, 
            borrower, 
            _amountToBorrowUSD,
            _collateralAmountXRP, 
            _maxCollateralRatio, 
            _liquidationThreshold,
            _desiredInterestRate,
            _paymentDuration,
            _minimalPartialFill
        );
    }

    // 5% of interest income goes to the platform, so borrower pays principle + 105% of interest specified by the lender
    function acceptLendingRequest(
        string calldata sourceChain,
        string calldata sourceAddress, 
        string calldata tokenSymbol,
        uint256 _collateralAmountXRP,
        uint256 _requestId, 
        uint256 _borrowAmountUSD 
    ) internal {
        string memory borrower = sourceAddress;
        bool proceed = true;
        string memory errorMesg = "";
        LendingRequest storage request = lendingRequests[_requestId];
        if (request.canceled) {
            proceed = false;
            errorMesg = "Request is already canceled";
        } else if (bytes(request.lender).length == 0) {
            proceed = false;
            errorMesg = "Lending request not found";
        } else if (_borrowAmountUSD < request.minimalPartialFill) {
            proceed = false;
            errorMesg = "Borrow amount is less than minimal fill";
        } else if (_borrowAmountUSD > (request.amountToLendUSD - request.amountLendedUSD)) {
            proceed = false;
            errorMesg = "Borrow amount exceeds remaining lend amount";
        } else if (_collateralAmountXRP < calculateCollateralAt(_borrowAmountUSD, request.minCollateralRatio)) {
            proceed = false;
            errorMesg = "Insufficient collateral";
        } else if (keccak256(bytes(tokenSymbol)) != keccak256(bytes("XRP"))) {
            proceed = false;
            errorMesg = "Invalid token symbol";
        }

        if (!proceed) {
            gateway().sendToken(sourceChain, borrower, tokenSymbol, _collateralAmountXRP-1);
            revert(errorMesg);
        }
       
        // Attempt to send USD to borrower via Axelar
        try gateway().sendToken(sourceChain, borrower, "USD", _borrowAmountUSD) {
            loanCounter++;
            uint256 interest = calculateInterest(_borrowAmountUSD, request.desiredInterestRate);
            uint256 platformFee = (interest * PLATFORM_FEE_PERCENT) / 100;
            uint256 amountPayableToLender = _borrowAmountUSD + interest;
            uint256 amountPayableToPlatform = platformFee;

            loans[loanCounter] = Loan({
                lender: request.lender,
                borrower: borrower,
                amountBorrowedUSD: _borrowAmountUSD,
                amountPayableToLender: amountPayableToLender,
                amountPayableToPlatform: amountPayableToPlatform,
                amountPaidUSD: 0, // Initialize to 0
                collateralAmountXRP: _collateralAmountXRP,
                repayBy: block.timestamp + request.paymentDuration,
                liquidationThreshold: request.liquidationThreshold,
                isLiquidated: false
            });

            userLoans[borrower].push(loanCounter);
            request.amountLendedUSD += _borrowAmountUSD;

            if (request.amountLendedUSD - request.amountToLendUSD < request.minimalPartialFill) {
                mustCancelLendingRequest(_requestId);
            }

            emit LoanCreated(
                loanCounter,
                request.lender,
                borrower,
                _borrowAmountUSD,
                _collateralAmountXRP,
                amountPayableToLender,
                amountPayableToPlatform,
                block.timestamp + request.paymentDuration,
                request.liquidationThreshold
            );
            emit RequestFilled(_requestId, _borrowAmountUSD);
        } catch {
            revert("Failed to send USD to borrower");
        }
    }

    // 5% of interest income goes to the platform, so lender receives principle + 95% of interest specified by the borrower
    function acceptBorrowingRequest(
        string calldata sourceChain, 
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 _amountToLendUSD, 
        uint256 _requestId,
        uint256 _collateralAmountXRP
    ) internal {
        string memory lender = sourceAddress;
        bool proceed = true;
        string memory errorMesg = "";
        // Validate Borrowing Request
        BorrowingRequest storage request = borrowingRequests[_requestId];

        if (request.canceled) {
            proceed = false;
            errorMesg = "Request is already canceled";
        } else if (bytes(request.borrower).length == 0) {
            proceed = false;
            errorMesg = "Borrowing request not found";
        } else if (_amountToLendUSD < request.minimalPartialFill) {
            proceed = false;
            errorMesg = "Lend amount is less than minimal fill";
        } else if (_amountToLendUSD > (request.amountToBorrowUSD - request.amountBorrowedUSD)) {
            proceed = false;
            errorMesg = "Lend amount exceeds remaining borrow amount";
        } else if (_collateralAmountXRP > request.existingCollateralAmountXRP) {
            proceed = false;
            errorMesg = "Asking for too much collateral";
        } else if (keccak256(bytes(tokenSymbol)) != keccak256(bytes("USD"))) {
            proceed = false;
            errorMesg = "Invalid token symbol";
        }

        if (!proceed) {
            gateway().sendToken(sourceChain, lender, tokenSymbol, _amountToLendUSD-1);
            revert(errorMesg);
        }
        
        // Attempt to send USD to borrower via Axelar
        try gateway().sendToken(sourceChain, request.borrower, "USD", _amountToLendUSD) {
            loanCounter++;
            uint256 interestPaidByBorrower = calculateInterest(_amountToLendUSD, request.desiredInterestRate);
            uint256 interestReceivedByPlatform = (interestPaidByBorrower * PLATFORM_FEE_PERCENT) / 100;
            uint256 interestReceivedByLender = interestPaidByBorrower - interestReceivedByPlatform;

            loans[loanCounter] = Loan({
                lender: lender,
                borrower: request.borrower,
                amountBorrowedUSD: _amountToLendUSD,
                amountPayableToLender: _amountToLendUSD + interestReceivedByLender,
                amountPayableToPlatform: interestReceivedByPlatform,
                amountPaidUSD: 0, 
                collateralAmountXRP: _collateralAmountXRP,
                repayBy: block.timestamp + request.paymentDuration,
                liquidationThreshold: request.liquidationThreshold,
                isLiquidated: false
            });

            userLoans[request.borrower].push(loanCounter);
            request.amountBorrowedUSD += _amountToLendUSD;
            request.existingCollateralAmountXRP -= _collateralAmountXRP;

            if (request.existingCollateralAmountXRP < calculateCollateralAt(request.minimalPartialFill, request.maxCollateralRatio)) {
                mustCancelBorrowingRequest(_requestId);
            }

            emit LoanCreated(
                loanCounter, 
                lender, 
                request.borrower, 
                _amountToLendUSD,
                _collateralAmountXRP,
                _amountToLendUSD + interestReceivedByLender,
                interestReceivedByPlatform,
                block.timestamp + request.paymentDuration,
                request.liquidationThreshold
            );
            emit RequestFilled(_requestId, _amountToLendUSD);
        } catch {
            revert("Failed to send USD to borrower");
        }
    }

    // --- Cancel Functions ---
    function cancelLendingRequest(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 _requestId
    ) internal {
        string memory canceller = sourceAddress;
        
        LendingRequest storage request = lendingRequests[_requestId];
        require(keccak256(bytes(request.lender)) == keccak256(bytes(canceller)), "Not the request creator");
        require(!request.canceled, "Request is already canceled");
        request.canceled = true;

        emit LendingRequestCanceled(_requestId, canceller);
    }

    function cancelBorrowingRequest(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 _requestId
    ) internal {
        string memory canceller = sourceAddress;
        
        BorrowingRequest storage request = borrowingRequests[_requestId];
        require(keccak256(bytes(request.borrower)) == keccak256(bytes(canceller)), "Not the request creator");
        require(!request.canceled, "Request is already canceled");
        request.canceled = true;

        emit BorrowingRequestCanceled(_requestId, canceller);
    }

    function mustCancelLendingRequest(uint256 _requestId) internal {
        LendingRequest storage request = lendingRequests[_requestId];
        require(!request.canceled, "Request is already canceled");
        request.canceled = true;
        emit LendingRequestAutoCanceled(_requestId);
    }

    function mustCancelBorrowingRequest(uint256 _requestId) internal {
        BorrowingRequest storage request = borrowingRequests[_requestId];
        require(!request.canceled, "Request is already canceled");
        request.canceled = true;
        emit BorrowingRequestAutoCanceled(_requestId);
    }

    // --- Repay Function ---
    function repayLoan(
        string calldata sourceChain, 
        string calldata sourceAddress, 
        string calldata tokenSymbol, 
        uint256 _repayAmountUSD,
        uint256 _loanId
    ) internal {
        string memory borrower = sourceAddress;
        bool proceed = true;
        string memory errorMesg = "";
        Loan storage loan = loans[_loanId];

        if (keccak256(bytes(tokenSymbol)) != keccak256(bytes("USD"))) {
            proceed = false;
            errorMesg = "Invalid token symbol";
        } else if (keccak256(bytes(loan.borrower)) != keccak256(bytes(borrower))) {
            proceed = false;
            errorMesg = "Not the loan owner";
        } else if (loan.isLiquidated) {
            proceed = false;
            errorMesg = "Loan is already liquidated";
        } else if (_repayAmountUSD == 0) {
            proceed = false;
            errorMesg = "Repayment amount must be greater than zero";
        } else if (_repayAmountUSD + loan.amountPaidUSD > loan.amountPayableToLender) {
            proceed = false;
            errorMesg = "Repayment exceeds amount owed";
        }

        if (!proceed) {
            gateway().sendToken(sourceChain, borrower, tokenSymbol, _repayAmountUSD-1);
            revert(errorMesg);
        }
        try gateway().sendToken(sourceChain, borrower, "USD", _repayAmountUSD) {
            // Update loan state
            loan.amountPaidUSD += _repayAmountUSD;
            emit LoanRepaid(_loanId, _repayAmountUSD, loan.amountPaidUSD);
        } catch {
            revert("Failed to send USD to borrower");
        }
        // Check if loan is completely paid, then send back collateral.
        if (loan.amountPaidUSD >= loan.amountPayableToLender) {
            // Transfer collateral back to borrower via Axelar
            try gateway().sendToken(sourceChain, borrower, "XRP", loan.collateralAmountXRP) {
                // Emit event
                emit LoanRepaid(_loanId, _repayAmountUSD, loan.amountPaidUSD);
            } catch {
                revert("Failed to send XRP to borrower");
            }
        }
    }

    // --- Liquidate Function ---
    function liquidateLoan(uint256 _loanId, string calldata caller) internal {
        Loan storage loan = loans[_loanId];

        require(!loan.isLiquidated, "Loan already liquidated");
        require(block.timestamp > loan.repayBy, "Cannot liquidate before due date");
        updatePrice();
        uint256 currentCollateralValueUSD = (loan.collateralAmountXRP * currentXRPPriceUSD);
        uint256 liquidationThresholdValue = (loan.amountPayableToLender * loan.liquidationThreshold) / 100;
        // Check if loan is undercollateralized
        require(currentCollateralValueUSD < liquidationThresholdValue, "Cannot liquidate yet");
        // Ensure that the caller is the lender
        require(keccak256(bytes(loan.lender)) == keccak256(bytes(caller)), "Only the lender can liquidate the loan");

        try gateway().sendToken(supportedSourceChain, loan.lender, "XRP", loan.collateralAmountXRP) {
            loan.isLiquidated = true;
            emit LoanLiquidated(_loanId, caller, loan.collateralAmountXRP);
        } catch {
            revert("Failed to send XRP to lender");
        }
    }

    // --- Utility Functions ---
    function calculateInterest(uint256 _amountBorrowedUSD, uint256 _desiredInterestRate) internal pure returns (uint256) {
        return (_amountBorrowedUSD * _desiredInterestRate) / 100;
    }
    // minCollateralRatio 150 means 150%, currentXRPPriceUSD 21164 means 1 XRP = 2.1164 USD, so multiply by 10 on the numerator
    function calculateCollateralAt(uint256 _amountBorrowedUSD, uint256 _collateralRatio) internal view returns (uint256) {
        return (_amountBorrowedUSD * _collateralRatio * 10) / currentXRPPriceUSD;
    }

    function calculatePayableAmount(uint256 _amountBorrowedUSD, uint256 _desiredInterestRate) 
        internal 
        pure 
        returns (uint256)
    {
        return _amountBorrowedUSD + calculateInterest(_amountBorrowedUSD, _desiredInterestRate);
    }

    function updatePrice() internal {
        // Update price no more frequently than once every hour
        if (block.timestamp - lastPriceUpdateTimestamp >= 3600) {
            currentXRPPriceUSD = priceOracle.getPriceXRPUSDT();
            lastPriceUpdateTimestamp = block.timestamp;
            emit PriceUpdated(currentXRPPriceUSD);
        }
    }

    // --- View Functions ---
    function getLoanDetails(uint256 _loanId) public view returns (Loan memory) {
        return loans[_loanId];
    }

    function getUserLoans(string memory _user) public view returns (uint256[] memory) {
        return userLoans[_user];
    }

    function getLendingRequest(uint256 _requestId) public view returns (LendingRequest memory) {
        return lendingRequests[_requestId];
    }

    function getBorrowingRequest(uint256 _requestId) public view returns (BorrowingRequest memory) {
        return borrowingRequests[_requestId];
    }

    function getUserLendingRequests(string memory _user) public view returns (uint256[] memory) {
        return userLendingRequests[_user];
    }

    function getUserBorrowingRequests(string memory _user) public view returns (uint256[] memory) {
        return userBorrowingRequests[_user];
    }

    function getCurrentPrice() public view returns (uint256) {
        return currentXRPPriceUSD;
    }
}