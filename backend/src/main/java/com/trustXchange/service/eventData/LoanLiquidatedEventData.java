package com.trustXchange.service.eventData;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class LoanLiquidatedEventData extends  P2PEventData {
    int loanId;
    String liquidator;
    BigDecimal collateralLiquidated;
}