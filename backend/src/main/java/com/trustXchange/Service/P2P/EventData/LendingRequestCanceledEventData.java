package com.trustXchange.Service.P2P.EventData;

import lombok.Value;
@Value
public class LendingRequestCanceledEventData extends  P2PEventData {
    int requestId;
    String canceller;
}