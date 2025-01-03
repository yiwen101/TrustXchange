package com.trustXchange.service.pledge.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class LiquidityWithdrawn  {
    String user;
    BigInteger amount;
    BigInteger confirmedRewards;
    BigInteger contributionBalance;
    BigInteger rewardDebt;
}