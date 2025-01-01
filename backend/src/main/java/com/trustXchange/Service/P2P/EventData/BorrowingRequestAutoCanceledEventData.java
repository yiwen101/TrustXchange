package com.trustXchange.Service.P2P.EventData;

import lombok.Value;


@Value
public class BorrowingRequestAutoCanceledEventData extends  P2PEventData {
    int requestId;
}