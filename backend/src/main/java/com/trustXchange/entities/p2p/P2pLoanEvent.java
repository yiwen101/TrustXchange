package com.trustXchange.entities.p2p;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "p2p_loan_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class P2pLoanEvent  {

    @Id
    @Column(name = "transaction_hash")
    private String transactionHash;

    @Column(name = "transaction_url")
    private String transactionUrl;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "amount")
    private Long amount;

    @Column(name = "loan_id")
    private Integer loanId;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name = "loan_id", referencedColumnName = "loan_id", insertable = false, updatable = false)
    private P2pLoan p2pLoan;
}