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
@Table(name = "p2p_borrowing_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class P2pBorrowingRequest {

    @Id
    @Column(name = "request_id")
    private Integer requestId;

    @Column(name = "borrower")
    private String borrower;

    @Column(name = "amount_to_borrow_usd")
    private Long amountToBorrowUsd;

    @Column(name = "amount_borrowed_usd")
    private Long amountBorrowedUsd;

    @Column(name = "initial_collateral_amount_xrp")
    private Long initialCollateralAmountXrp;

    @Column(name = "existing_collateral_amount_xrp")
    private Long existingCollateralAmountXrp;

    @Column(name = "max_collateral_ratio")
    private Long maxCollateralRatio;

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