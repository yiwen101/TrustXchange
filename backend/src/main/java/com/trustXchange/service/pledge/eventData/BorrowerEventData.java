package com.trustXchange.service.pledge.eventData;

import lombok.Value;
import java.math.BigInteger;

@Value
public class BorrowerEventData  extends PledgeEventData {
    String eventName;
    BigInteger amount;
    String borrower;
    BigInteger borrowAmountUSD;
    BigInteger amountPayableUSD;
    BigInteger collateralAmountXRP;
    BigInteger lastPayableUpdateTime;
    BigInteger repaidUSD;
}