package com.trustXchange.service.p2p.eventData;

import lombok.Value;
import java.math.BigInteger;

@Value
public class BorrowingRequestEventData  extends P2PEventData {
    String eventName;
    BigInteger requestId;
    String borrower;
    BigInteger amountToBorrowUSD;
    BigInteger amountBorrowedUSD;
    BigInteger initialCollateralAmountXRP;
    BigInteger existingCollateralAmountXRP;
    BigInteger maxCollateralRatio;
    BigInteger liquidationThreshold;
    BigInteger desiredInterestRate;
    BigInteger paymentDuration;
    BigInteger minimalPartialFill;
    boolean canceled;
    boolean autoCanceled;
}