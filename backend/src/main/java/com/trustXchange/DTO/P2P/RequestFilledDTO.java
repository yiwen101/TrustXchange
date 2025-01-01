package com.trustXchange.DTO.P2P;
import java.math.BigDecimal;

import lombok.Value;

@Value
public class RequestFilledDTO extends  P2PEventData {
    int requestId;
    BigDecimal amountFilled;
}