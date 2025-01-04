package com.trustXchange.entities.p2p;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;


@Entity
@Table(name = "p2p_loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

     @Column(name = "lend_request_id")
    private Integer lendRequestId;

    @Column(name = "borrow_request_id")
    private Integer borrowRequestId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;

}