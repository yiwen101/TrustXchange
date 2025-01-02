package com.trustXchange.service.p2p.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class BorrowingRequestCreatedEventData  extends  P2PEventData {
    int requestId;
    String borrower;
    BigInteger amountToBorrowUSD;
    BigInteger collateralAmountXRP;
    BigInteger maxCollateralRatio;
    BigInteger liquidationThreshold;
    BigInteger desiredInterestRate;
    BigInteger paymentDuration;
    BigInteger minimalPartialFill;
}