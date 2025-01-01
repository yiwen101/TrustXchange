package com.trustXchange.dto.p2p;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;



@Data
@AllArgsConstructor
public class P2PLoanDTO {
     int loanId;
        String lender;
        String borrower;
        BigDecimal amountBorrowedUSD;
        BigDecimal amountPayableToLender;
        BigDecimal amountPayableToPlatform;
        BigDecimal amountPaidUSD;
        BigDecimal collateralAmountXRP;
        Instant repayBy;
        BigDecimal liquidationThreshold;
        boolean isLiquidated;
}
