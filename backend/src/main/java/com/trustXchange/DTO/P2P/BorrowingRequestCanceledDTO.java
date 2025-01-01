package com.trustXchange.DTO.P2P;

import lombok.Value;

@Value
public class BorrowingRequestCanceledDTO extends  P2PEventData {
    int requestId;
    String canceller;
}