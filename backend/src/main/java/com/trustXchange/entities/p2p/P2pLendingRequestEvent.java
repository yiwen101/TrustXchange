package com.trustXchange.entities.p2p;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "p2p_lending_request_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class P2pLendingRequestEvent  {

    @Id
    @Column(name = "transaction_hash")
    private String transactionHash;

    @Column(name = "transaction_url")
    private String transactionUrl;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "request_id")
    private Integer requestId;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name = "request_id", referencedColumnName = "request_id", insertable = false, updatable = false)
    private P2pLendingRequest p2pLendingRequest;


}