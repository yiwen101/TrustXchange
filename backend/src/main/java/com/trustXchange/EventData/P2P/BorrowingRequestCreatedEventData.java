package com.trustXchange.EventData.P2P;

import java.math.BigDecimal;
import java.time.Duration;

import lombok.Value;

@Value
public class BorrowingRequestCreatedEventData extends P2PEventData {
    int requestId;
    String borrower;
    BigDecimal amountToBorrowUSD;
    BigDecimal collateralAmountXRP;
    BigDecimal maxCollateralRatio;
    BigDecimal liquidationThreshold;
    BigDecimal desiredInterestRate;
    Duration paymentDuration;
    BigDecimal minimalPartialFill;
}