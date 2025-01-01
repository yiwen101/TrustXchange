package com.trustXchange.DTO.P2P;

import lombok.Value;


@Value
public class BorrowingRequestAutoCanceledDTO extends  P2PEventData {
    int requestId;
}