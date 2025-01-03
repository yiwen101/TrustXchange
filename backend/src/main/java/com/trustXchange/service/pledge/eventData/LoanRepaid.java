package com.trustXchange.service.pledge.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class LoanRepaid  {
     BigInteger loanId;
    BigInteger repaidAmountUSD;
    BigInteger remainingAmountPayableUSD;
}