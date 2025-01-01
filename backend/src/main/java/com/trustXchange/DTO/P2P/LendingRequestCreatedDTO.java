package com.trustXchange.DTO.P2P;

import java.math.BigDecimal;

import lombok.Value;

@Value
public class LendingRequestCreatedDTO extends  P2PEventData {
    int requestId;
    String lender;
    BigDecimal amountToLendUSD;
    BigDecimal minCollateralRatio;
    BigDecimal liquidationThreshold;
    BigDecimal desiredInterestRate;
    BigDecimal paymentDuration;
    BigDecimal minimalPartialFill;
}