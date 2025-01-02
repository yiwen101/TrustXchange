package com.trustXchange.entities.p2p;

import javax.persistence.*;

@Entity
@Table(name = "p2p_lending_requests")
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


    // Default constructor
    public P2pLendingRequest() {
    }

    // Getters and setters


    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public String getLender() {
        return lender;
    }

    public void setLender(String lender) {
        this.lender = lender;
    }

    public Long getAmountToLendUsd() {
        return amountToLendUsd;
    }

    public void setAmountToLendUsd(Long amountToLendUsd) {
        this.amountToLendUsd = amountToLendUsd;
    }

    public Long getAmountLendedUsd() {
        return amountLendedUsd;
    }

    public void setAmountLendedUsd(Long amountLendedUsd) {
        this.amountLendedUsd = amountLendedUsd;
    }

    public Long getMinCollateralRatio() {
        return minCollateralRatio;
    }

    public void setMinCollateralRatio(Long minCollateralRatio) {
        this.minCollateralRatio = minCollateralRatio;
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