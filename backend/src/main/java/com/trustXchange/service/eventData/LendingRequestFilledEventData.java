package com.trustXchange.service.eventData;
import java.math.BigDecimal;

import lombok.Value;

@Value
public class LendingRequestFilledEventData extends  P2PEventData {
    int requestId;
    int loanId;
}