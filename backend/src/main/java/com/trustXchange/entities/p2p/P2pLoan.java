package com.trustXchange.entities.p2p;

import javax.persistence.*;
import java.sql.Timestamp;


@Entity
@Table(name = "p2p_loans")
public class P2pLoan {

    @Id
    @Column(name = "loan_id")
    private Integer loanId;

    @Column(name = "lender")
    private String lender;

    @Column(name = "borrower")
    private String borrower;

    @Column(name = "amount_borrowed_usd")
    private Long amountBorrowedUsd;

    @Column(name = "amount_payable_to_lender")
    private Long amountPayableToLender;

    @Column(name = "amount_payable_to_platform")
    private Long amountPayableToPlatform;

    @Column(name = "amount_paid_usd")
    private Long amountPaidUsd;

    @Column(name = "collateral_amount_xrp")
    private Long collateralAmountXrp;

    @Column(name = "repay_by")
    private Timestamp repayBy;

    @Column(name = "liquidation_threshold")
    private Long liquidationThreshold;

    @Column(name = "is_liquidated")
    private Boolean isLiquidated;

    // Default constructor
    public P2pLoan() {
    }


    // Getters and setters

    public Integer getLoanId() {
        return loanId;
    }

    public void setLoanId(Integer loanId) {
        this.loanId = loanId;
    }

    public String getLender() {
        return lender;
    }

    public void setLender(String lender) {
        this.lender = lender;
    }

    public String getBorrower() {
        return borrower;
    }

    public void setBorrower(String borrower) {
        this.borrower = borrower;
    }

    public Long getAmountBorrowedUsd() {
        return amountBorrowedUsd;
    }

    public void setAmountBorrowedUsd(Long amountBorrowedUsd) {
        this.amountBorrowedUsd = amountBorrowedUsd;
    }

    public Long getAmountPayableToLender() {
        return amountPayableToLender;
    }

    public void setAmountPayableToLender(Long amountPayableToLender) {
        this.amountPayableToLender = amountPayableToLender;
    }

    public Long getAmountPayableToPlatform() {
        return amountPayableToPlatform;
    }

    public void setAmountPayableToPlatform(Long amountPayableToPlatform) {
        this.amountPayableToPlatform = amountPayableToPlatform;
    }

    public Long getAmountPaidUsd() {
        return amountPaidUsd;
    }

    public void setAmountPaidUsd(Long amountPaidUsd) {
        this.amountPaidUsd = amountPaidUsd;
    }

    public Long getCollateralAmountXrp() {
        return collateralAmountXrp;
    }

    public void setCollateralAmountXrp(Long collateralAmountXrp) {
        this.collateralAmountXrp = collateralAmountXrp;
    }

    public Timestamp getRepayBy() {
        return repayBy;
    }

    public void setRepayBy(Timestamp repayBy) {
        this.repayBy = repayBy;
    }

    public Long getLiquidationThreshold() {
        return liquidationThreshold;
    }

    public void setLiquidationThreshold(Long liquidationThreshold) {
        this.liquidationThreshold = liquidationThreshold;
    }

    public Boolean getLiquidated() {
        return isLiquidated;
    }

    public void setLiquidated(Boolean liquidated) {
        isLiquidated = liquidated;
    }
}