package com.trustXchange.DTO.P2P;

import lombok.Value;

@Value
public class LendingRequestAutoCanceledDTO extends  P2PEventData {
    int requestId;
}