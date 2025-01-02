package com.trustXchange.service.p2p.eventData;

import java.math.BigInteger;

import lombok.Value;


@Value
public class LoanCreatedFromBorrowingRequestEventData  extends  P2PEventData {
     int loanId;
    int requestId;
    String lender;
    String borrower;
    BigInteger amountBorrowedUSD;
    BigInteger collateralAmountXRP;
    BigInteger amountPayableToLender;
    BigInteger amountPayableToPlatform;
    BigInteger repayBy;
    BigInteger liquidationThreshold;
}