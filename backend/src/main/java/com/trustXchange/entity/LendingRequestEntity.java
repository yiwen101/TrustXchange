package com.trustXchange.entity;

import javax.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lending_requests")
@Data
public class LendingRequestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private int requestId;

    @Column(name = "lender")
    private String lender;

    @Column(name = "amount_to_lend_usd")
    private Double amountToLendUSD;

    @Column(name = "amount_lended_usd")
    private Double amountLendedUSD;

    @Column(name = "min_collateral_ratio")
    private Double minCollateralRatio;

    @Column(name = "liquidation_threshold")
    private Double liquidationThreshold;

    @Column(name = "desired_interest_rate")
    private Double desiredInterestRate;

    @Column(name = "payment_duration")
    private Long paymentDuration;

    @Column(name = "minimal_partial_fill")
    private Double minimalPartialFill;

    @Column(name = "canceled")
    private boolean canceled;

    @Column(name = "canceled_by_system")
    private boolean canceledBySystem;


}