package com.trustXchange.EventData.P2P;

import java.math.BigDecimal;
import java.time.Duration;

import lombok.Value;

@Value
public class LendingRequestCreatedEventData extends  P2PEventData {
    int requestId;
    String lender;
    BigDecimal amountToLendUSD;
    BigDecimal minCollateralRatio;
    BigDecimal liquidationThreshold;
    BigDecimal desiredInterestRate;
    Duration paymentDuration;
    BigDecimal minimalPartialFill;
}