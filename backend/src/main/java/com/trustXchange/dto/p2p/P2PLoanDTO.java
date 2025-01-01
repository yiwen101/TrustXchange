package com.trustXchange.dto.p2p;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;



@Data
@AllArgsConstructor
public class P2PLoanDTO {
     int loanId;
        String lender;
        String borrower;
        double amountBorrowedUSD;
        double amountPayableToLender;
        double amountPayableToPlatform;
        double amountPaidUSD;
        double collateralAmountXRP;
        Instant repayBy;
        double liquidationThreshold;
        boolean isLiquidated;
}
