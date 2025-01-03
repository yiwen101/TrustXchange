package com.trustXchange.service.pledge.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class LoanCreated  {
    BigInteger loanId;
    String borrower;
    BigInteger borrowAmountUSD;
    BigInteger collateralAmountXRP;
    BigInteger lastInterestUpdateTime;
}