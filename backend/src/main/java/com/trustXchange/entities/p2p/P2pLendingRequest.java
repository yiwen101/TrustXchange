package com.trustXchange.entities.p2p;

import java.sql.Timestamp;

import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "p2p_lending_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class P2pLendingRequest {

    @Id
    @Column(name = "request_id")
    private Integer requestId;

    @Column(name = "lender")
    private String lender;

    @Column(name = "amount_to_lend_usd")
    private Long amountToLendUsd;

    @Column(name = "amount_lended_usd")
    private Long amountLendedUsd;

    @Column(name = "min_collateral_ratio")
    private Long minCollateralRatio;

    @Column(name = "liquidation_threshold")
    private Long liquidationThreshold;

    @Column(name = "desired_interest_rate")
    private Long desiredInterestRate;

    @Column(name = "payment_duration")
    private Long paymentDuration;

    @Column(name = "minimal_partial_fill")
    private Long minimalPartialFill;

    @Column(name = "canceled")
    private Boolean canceled;

    @Column(name = "canceled_by_system")
    private Boolean canceledBySystem;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;
}