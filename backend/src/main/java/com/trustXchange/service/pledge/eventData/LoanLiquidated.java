package com.trustXchange.service.pledge.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class LoanLiquidated  {
     BigInteger loanId;
    BigInteger collateralValueUSD;
    BigInteger amountPayableUSD;
    BigInteger currentPriceUSD;
}