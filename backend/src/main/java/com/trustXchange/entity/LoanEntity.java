package com.trustXchange.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Table(name = "loans")
@Data
public class LoanEntity {
    @Id
    @Column(name="loan_id")
    private int loanId;
    @Column(name="lender")
    private String lender;
    @Column(name="borrower")
    private String borrower;
    @Column(name="amount_borrowed_usd")
    private Double amountBorrowedUSD;
    @Column(name="amount_payable_to_lender")
    private Double amountPayableToLender;
    @Column(name="amount_payable_to_platform")
    private Double amountPayableToPlatform;
    @Column(name="amount_paid_usd")
    private Double amountPaidUSD;
    @Column(name="collateral_amount_xrp")
    private Double collateralAmountXRP;
    @Column(name="repay_by")
    private Timestamp repayBy;
    @Column(name="liquidation_threshold")
    private Double liquidationThreshold;
    @Column(name="is_liquidated")
    private boolean isLiquidated;
}