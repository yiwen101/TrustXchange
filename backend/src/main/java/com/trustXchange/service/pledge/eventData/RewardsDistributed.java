package com.trustXchange.service.pledge.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class RewardsDistributed  {
    BigInteger rewardAmount;
    BigInteger accRewardPerShareE18;
}