package com.trustXchange.DTO.P2P;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class LoanRepaidDTO extends  P2PEventData {
    int loanId;
    BigDecimal amountRepaid;
    BigDecimal totalPaid;
}