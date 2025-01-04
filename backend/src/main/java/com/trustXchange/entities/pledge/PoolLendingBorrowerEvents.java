package com.trustXchange.entities.pledge;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "pool_lending_borrower_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PoolLendingBorrowerEvents  {

    @Id
    @Column(name = "transaction_hash", nullable = false)
    private String transactionHash;

    @Column(name = "transaction_url", nullable = false)
    private String transactionUrl;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "amount")
    private Long amount;


    @Column(name = "borrower_address", nullable = false)
     private String borrowerAddress;


    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name = "borrower_address",referencedColumnName = "borrower_address", insertable = false, updatable = false)
    private PoolLendingBorrower poolLendingBorrower;
}