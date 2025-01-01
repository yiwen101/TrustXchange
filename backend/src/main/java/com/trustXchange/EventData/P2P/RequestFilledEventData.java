package com.trustXchange.EventData.P2P;
import java.math.BigDecimal;

import lombok.Value;

@Value
public class RequestFilledEventData extends  P2PEventData {
    int requestId;
    BigDecimal amountFilled;
}