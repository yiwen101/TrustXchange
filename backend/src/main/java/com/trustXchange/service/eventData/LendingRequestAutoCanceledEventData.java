package com.trustXchange.service.eventData;

import lombok.Value;

@Value
public class LendingRequestAutoCanceledEventData extends  P2PEventData {
    int requestId;
}