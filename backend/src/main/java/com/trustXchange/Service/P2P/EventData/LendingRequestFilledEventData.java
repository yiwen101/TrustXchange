package com.trustXchange.Service.P2P.EventData;
import java.math.BigDecimal;

import lombok.Value;

@Value
public class LendingRequestFilledEventData extends  P2PEventData {
    int requestId;
    int loanId;
}