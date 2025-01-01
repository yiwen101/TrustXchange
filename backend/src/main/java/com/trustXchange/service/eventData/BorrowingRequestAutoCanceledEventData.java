package com.trustXchange.service.eventData;

import lombok.Value;


@Value
public class BorrowingRequestAutoCanceledEventData extends  P2PEventData {
    int requestId;
}