package com.trustXchange.service.p2p.eventData;

import lombok.Value;

@Value
public class LendingRequestAutoCanceledEventData  extends P2PEventData {
    int requestId;
}