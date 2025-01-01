package com.trustXchange.EventData.P2P;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class LoanUpdatedEventData extends  P2PEventData {
    int loanId;
    String borrower;
    BigDecimal newAmountBorrowedUSD;
    BigDecimal newCollateralAmountXRP;
    BigDecimal newAmountPayableToLender;
}