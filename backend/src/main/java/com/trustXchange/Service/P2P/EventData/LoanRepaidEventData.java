package com.trustXchange.Service.P2P.EventData;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class LoanRepaidEventData extends  P2PEventData {
    int loanId;
    BigDecimal amountRepaid;
    BigDecimal totalPaid;
}