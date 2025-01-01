package com.trustXchange.entity;

import javax.persistence.*;
import lombok.Data;

@Entity
@Table(name = "p2p_borrowing_request_filled")
@Data
@IdClass(P2PBorrowingRequestFilledId.class)
public class P2PBorrowingRequestFilledEntity {

    @Id
    @Column(name = "request_id")
    private int requestId;

    @Id
    @Column(name = "loan_id")
    private int loanId;

}