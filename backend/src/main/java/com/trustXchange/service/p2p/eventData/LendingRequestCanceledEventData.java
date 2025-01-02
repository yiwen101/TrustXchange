package com.trustXchange.service.p2p.eventData;

import lombok.Value;

@Value
public class LendingRequestCanceledEventData  extends  P2PEventData {
    int requestId;
    String canceller;
}