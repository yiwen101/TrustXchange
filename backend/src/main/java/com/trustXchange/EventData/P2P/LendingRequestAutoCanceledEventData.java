package com.trustXchange.EventData.P2P;

import lombok.Value;

@Value
public class LendingRequestAutoCanceledEventData extends  P2PEventData {
    int requestId;
}