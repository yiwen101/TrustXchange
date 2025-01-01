package com.trustXchange.DTO.P2P;

import lombok.Value;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Utf8String;

@Value
public class LoanCreatedDTO extends  P2PEventData {
    Uint256 loanId;
    Utf8String lender;
    Utf8String borrower;
    Uint256 amountBorrowedUSD;
    Uint256 collateralAmountXRP;
    Uint256 amountPayableToLender;
    Uint256 amountPayableToPlatform;
    Uint256 repayBy;
    Uint256 liquidationThreshold;
}