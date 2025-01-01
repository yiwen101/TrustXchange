package com.trustXchange.DTO.P2P;

import java.math.BigDecimal;
import java.time.Duration;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class P2PLendingRequestDTO {
    int requestId;
    String lender;
    BigDecimal amountToLendUSD;
    BigDecimal amountLendedUSD;
    BigDecimal minCollateralRatio;
    BigDecimal liquidationThreshold;
    BigDecimal desiredInterestRate;
    Duration paymentDuration;
    BigDecimal minimalPartialFill;
    boolean canceled;
    boolean canceledBySystem;
}
