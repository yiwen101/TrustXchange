package com.trustXchange.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class P2PBorrowingRequestFilledId implements Serializable {
    private int requestId;
    private int loanId;

}