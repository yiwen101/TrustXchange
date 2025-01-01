package com.trustXchange.Service.P2P.EventData;

import lombok.Value;

@Value
public class BorrowingRequestFilledEventData extends  P2PEventData {
    int requestId;
    int loanId;
}
