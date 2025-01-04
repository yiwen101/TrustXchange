package com.trustXchange.service.pledge.eventData;

import lombok.Value;
import java.math.BigInteger;


@Value
public class PoolRewardEventData extends PledgeEventData {
    BigInteger rewardDistributed;
    BigInteger accRewardPerShareE18;
    BigInteger equity;
    BigInteger retainedEarning;
}