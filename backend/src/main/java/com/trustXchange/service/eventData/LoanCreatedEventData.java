package com.trustXchange.service.eventData;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.Value;

@Value
public class LoanCreatedEventData extends  P2PEventData {
    int loanId;
    String lender;
    String borrower;
    BigDecimal amountBorrowedUSD;
    BigDecimal collateralAmountXRP;
    BigDecimal amountPayableToLender;
    BigDecimal amountPayableToPlatform;
    Instant repayBy;
    BigDecimal liquidationThreshold;
}