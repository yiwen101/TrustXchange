package com.trustXchange.Service.P2P.EventData;

import lombok.Value;

@Value
public class LendingRequestAutoCanceledEventData extends  P2PEventData {
    int requestId;
}