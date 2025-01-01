package com.trustXchange.dto.p2p;

import java.time.Duration;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class P2PLendingRequestDTO {
    int requestId;
    String lender;
    double amountToLendUSD;
    double amountLendedUSD;
    double minCollateralRatio;
    double liquidationThreshold;
    double desiredInterestRate;
    Duration paymentDuration;
    double minimalPartialFill;
    boolean canceled;
    boolean canceledBySystem;
}
