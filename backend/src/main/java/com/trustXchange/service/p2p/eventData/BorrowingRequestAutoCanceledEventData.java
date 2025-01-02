package com.trustXchange.service.p2p.eventData;

import lombok.Value;

@Value
public class BorrowingRequestAutoCanceledEventData extends P2PEventData {
    int requestId;
}