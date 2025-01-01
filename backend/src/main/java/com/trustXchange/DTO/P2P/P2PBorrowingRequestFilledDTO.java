package com.trustXchange.DTO.P2P;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class P2PBorrowingRequestFilledDTO {
    int requestId;
    int loanId;
}
