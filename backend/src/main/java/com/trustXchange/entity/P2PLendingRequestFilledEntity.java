package com.trustXchange.entity;

import javax.persistence.*;
import lombok.Data;

@Entity
@Table(name = "p2p_lending_request_filled")
@Data
@IdClass(P2PLendingRequestFilledId.class)
public class P2PLendingRequestFilledEntity {

    @Id
    @Column(name = "request_id")
    private int requestId;

    @Id
    @Column(name = "loan_id")
    private int loanId;
}