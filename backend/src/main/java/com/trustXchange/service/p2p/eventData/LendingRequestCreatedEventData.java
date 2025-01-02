package com.trustXchange.service.p2p.eventData;

import java.math.BigInteger;

import lombok.Value;


@Value
public class LendingRequestCreatedEventData   extends  P2PEventData{
    int requestId;
    String lender;
    BigInteger amountToLendUSD;
    BigInteger minCollateralRatio;
    BigInteger liquidationThreshold;
    BigInteger desiredInterestRate;
    BigInteger paymentDuration;
    BigInteger minimalPartialFill;
}