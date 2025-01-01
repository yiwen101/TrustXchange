package com.trustXchange.EventData.P2P;

import lombok.Value;
@Value
public class LendingRequestCanceledEventData extends  P2PEventData {
    int requestId;
    String canceller;
}