package com.trustXchange.service.eventData;

import lombok.Value;

@Value
public class BorrowingRequestFilledEventData extends  P2PEventData {
    int requestId;
    int loanId;
}
