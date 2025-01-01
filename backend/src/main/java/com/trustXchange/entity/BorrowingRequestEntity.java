package com.trustXchange.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "p2p_borrowing_requests")
@Data
public class BorrowingRequestEntity {
    @Id
    @Column(name="request_id")
    private int requestId;
    @Column(name="borrower")
    private String borrower;
    @Column(name="amount_to_borrow_usd")
    private Double amountToBorrowUSD;
    @Column(name="amount_borrowed_usd")
    private Double amountBorrowedUSD;
    @Column(name="initial_collateral_amount_xrp")
    private Double initialCollateralAmountXRP;
    @Column(name="existing_collateral_amount_xrp")
    private Double existingCollateralAmountXRP;
    @Column(name="max_collateral_ratio")
    private Double maxCollateralRatio;
    @Column(name="liquidation_threshold")
    private Double liquidationThreshold;
    @Column(name="desired_interest_rate")
    private Double desiredInterestRate;
    @Column(name="payment_duration")
    private Long paymentDuration;
    @Column(name="minimal_partial_fill")
    private Double minimalPartialFill;
    @Column(name="canceled")
    private boolean canceled;
    @Column(name="canceled_by_system")
    private boolean canceledBySystem;
}