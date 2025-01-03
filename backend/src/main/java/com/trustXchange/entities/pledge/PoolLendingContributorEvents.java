package com.trustXchange.entities.pledge;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "pool_lending_contributor_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PoolLendingContributorEvents  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "amount")
    private Long amount;

    @Column(name = "contributor_address", nullable = false)
    private String contributorAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name = "contributor_address",referencedColumnName = "address",insertable = false, updatable = false)
    private PoolLendingContributor poolLendingContributor;
}