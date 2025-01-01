package com.trustXchange.service.eventData;

import lombok.Value;

@Value
public class BorrowingRequestCanceledEventData extends  P2PEventData {
    int requestId;
    String canceller;
}