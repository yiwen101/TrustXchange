package com.trustXchange.dto.p2p;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class P2PBorrowingRequestFilledDTO {
    int requestId;
    int loanId;
}
