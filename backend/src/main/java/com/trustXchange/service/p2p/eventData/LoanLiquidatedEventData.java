package com.trustXchange.service.p2p.eventData;

import java.math.BigInteger;

import lombok.Value;


@Value
public class LoanLiquidatedEventData  extends P2PEventData {
    int loanId;
    String liquidator;
    BigInteger collateralLiquidated;
}