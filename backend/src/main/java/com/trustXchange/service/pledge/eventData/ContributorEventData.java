package com.trustXchange.service.pledge.eventData;

import lombok.Value;
import java.math.BigInteger;

@Value
public class ContributorEventData  extends PledgeEventData {
    String eventName;
    BigInteger amount;
    String user;
    BigInteger contributionBalance;
    BigInteger rewardDebt;
    BigInteger confirmedRewards;
}