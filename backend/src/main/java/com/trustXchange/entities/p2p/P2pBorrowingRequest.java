package com.trustXchange.entities.p2p;

import javax.persistence.*;

@Entity
@Table(name = "p2p_borrowing_requests")
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


    // Default constructor (required by JPA)
    public P2pBorrowingRequest() {
    }


    // Getters and setters (you should include these)

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public String getBorrower() {
        return borrower;
    }

    public void setBorrower(String borrower) {
        this.borrower = borrower;
    }

    public Long getAmountToBorrowUsd() {
        return amountToBorrowUsd;
    }

    public void setAmountToBorrowUsd(Long amountToBorrowUsd) {
        this.amountToBorrowUsd = amountToBorrowUsd;
    }

    public Long getAmountBorrowedUsd() {
        return amountBorrowedUsd;
    }

    public void setAmountBorrowedUsd(Long amountBorrowedUsd) {
        this.amountBorrowedUsd = amountBorrowedUsd;
    }

    public Long getInitialCollateralAmountXrp() {
        return initialCollateralAmountXrp;
    }

    public void setInitialCollateralAmountXrp(Long initialCollateralAmountXrp) {
        this.initialCollateralAmountXrp = initialCollateralAmountXrp;
    }

    public Long getExistingCollateralAmountXrp() {
        return existingCollateralAmountXrp;
    }

    public void setExistingCollateralAmountXrp(Long existingCollateralAmountXrp) {
        this.existingCollateralAmountXrp = existingCollateralAmountXrp;
    }

    public Long getMaxCollateralRatio() {
        return maxCollateralRatio;
    }

    public void setMaxCollateralRatio(Long maxCollateralRatio) {
        this.maxCollateralRatio = maxCollateralRatio;
    }

    public Long getLiquidationThreshold() {
        return liquidationThreshold;
    }

    public void setLiquidationThreshold(Long liquidationThreshold) {
        this.liquidationThreshold = liquidationThreshold;
    }

    public Long getDesiredInterestRate() {
        return desiredInterestRate;
    }

    public void setDesiredInterestRate(Long desiredInterestRate) {
        this.desiredInterestRate = desiredInterestRate;
    }

    public Long getPaymentDuration() {
        return paymentDuration;
    }

    public void setPaymentDuration(Long paymentDuration) {
        this.paymentDuration = paymentDuration;
    }

    public Long getMinimalPartialFill() {
        return minimalPartialFill;
    }

    public void setMinimalPartialFill(Long minimalPartialFill) {
        this.minimalPartialFill = minimalPartialFill;
    }

    public Boolean getCanceled() {
        return canceled;
    }

    public void setCanceled(Boolean canceled) {
        this.canceled = canceled;
    }

    public Boolean getCanceledBySystem() {
        return canceledBySystem;
    }

    public void setCanceledBySystem(Boolean canceledBySystem) {
        this.canceledBySystem = canceledBySystem;
    }
}