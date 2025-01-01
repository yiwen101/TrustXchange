package com.trustXchange.DTO.P2P;

import java.time.Duration;

import lombok.Value;

@Value
public class P2PBorrowingRequestDTO {
    int requestId;
    String borrower;
    double amountToBorrowUSD;
    double amountBorrowedUSD;
    double initialCollateralAmountXRP;
    double existingCollateralAmountXRP;
    double maxCollateralRatio;
    double liquidationThreshold;
    double desiredInterestRate;
    Duration paymentDuration;
    double minimalPartialFill;
    boolean canceled;
}
