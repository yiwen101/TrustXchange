package com.trustXchange.entities.pledge;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "pool_lending_borrower")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PoolLendingBorrower  {

    @Id
    @Column(name = "borrower_address")
    private String borrowerAddress;

    @Column(name = "borrow_amount_usd", nullable = false)
    private Long borrowAmountUsd;

    @Column(name = "amount_payable_usd", nullable = false)
    private Long amountPayableUsd;

    @Column(name = "collateral_amount_xrp", nullable = false)
    private Long collateralAmountXrp;

    @Column(name = "last_payable_update_time")
    private Timestamp lastPayableUpdateTime;

    @Column(name = "repaid_usd", nullable = false)
    private Long repaidUsd;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;
}