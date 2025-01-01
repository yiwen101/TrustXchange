package com.trustXchange.service.eventData;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class LoanRepaidEventData extends  P2PEventData {
    int loanId;
    BigDecimal amountRepaid;
    BigDecimal totalPaid;
}