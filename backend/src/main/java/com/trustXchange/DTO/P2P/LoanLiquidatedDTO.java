package com.trustXchange.DTO.P2P;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class LoanLiquidatedDTO extends  P2PEventData {
    int loanId;
    String liquidator;
    BigDecimal collateralLiquidated;
}