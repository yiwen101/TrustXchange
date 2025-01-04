package com.trustXchange.service.p2p.eventData;

import lombok.Value;
import java.math.BigInteger;

@Value
public class LendingRequestEventData  extends P2PEventData {
    String eventName;
    BigInteger requestId;
    String lender;
    BigInteger amountToLendUSD;
    BigInteger amountLendedUSD;
    BigInteger minCollateralRatio;
    BigInteger liquidationThreshold;
    BigInteger desiredInterestRate;
    BigInteger paymentDuration;
    BigInteger minimalPartialFill;
    boolean canceled;
    boolean autoCanceled;
}