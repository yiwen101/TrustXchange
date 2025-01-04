package com.trustXchange.service.p2p.eventData;

import lombok.Value;
import java.math.BigInteger;

@Value
public class LoanEventData  extends P2PEventData {
    String eventName;
    BigInteger amount;
    BigInteger loanId;
    String lender;
    String borrower;
    BigInteger amountBorrowedUSD;
    BigInteger amountPayableToLender;
    BigInteger amountPayableToPlatform;
    BigInteger amountPaidUSD;
    BigInteger collateralAmountXRP;
    BigInteger repayBy;
    BigInteger liquidationThreshold;
    boolean isLiquidated;
}