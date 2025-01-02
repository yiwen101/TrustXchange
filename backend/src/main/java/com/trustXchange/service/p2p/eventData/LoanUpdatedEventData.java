package com.trustXchange.service.p2p.eventData;

import java.math.BigInteger;

import lombok.Value;


@Value
public class LoanUpdatedEventData  extends  P2PEventData {
    int loanId;
    String borrower;
    BigInteger newAmountBorrowedUSD;
    BigInteger newCollateralAmountXRP;
    BigInteger newAmountPayableToLender;
}