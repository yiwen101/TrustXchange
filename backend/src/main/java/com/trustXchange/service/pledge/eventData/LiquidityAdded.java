package com.trustXchange.service.pledge.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class LiquidityAdded  {
    String user;
    BigInteger amount;
    BigInteger confirmedRewards;
    BigInteger contributionBalance;
    BigInteger rewardDebt;
}