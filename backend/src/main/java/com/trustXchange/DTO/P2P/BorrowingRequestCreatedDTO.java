package com.trustXchange.DTO.P2P;

import java.math.BigDecimal;

import lombok.Value;

@Value
public class BorrowingRequestCreatedDTO extends P2PEventData {
    int requestId;
    String borrower;
    BigDecimal amountToBorrowUSD;
    BigDecimal collateralAmountXRP;
    BigDecimal maxCollateralRatio;
    BigDecimal liquidationThreshold;
    BigDecimal desiredInterestRate;
    BigDecimal paymentDuration;
    BigDecimal minimalPartialFill;
}