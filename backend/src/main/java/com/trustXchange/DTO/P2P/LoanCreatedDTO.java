package com.trustXchange.DTO.P2P;

import java.math.BigDecimal;

import lombok.Value;

@Value
public class LoanCreatedDTO extends  P2PEventData {
    int loanId;
    String lender;
    String borrower;
    BigDecimal amountBorrowedUSD;
    BigDecimal collateralAmountXRP;
    BigDecimal amountPayableToLender;
    BigDecimal amountPayableToPlatform;
    BigDecimal repayBy;
    BigDecimal liquidationThreshold;
}