package com.trustXchange.Service.P2P.EventData;

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