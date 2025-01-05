package com.trustXchange.entities.option;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "option_user_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserOptionBalance  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_address", nullable = false)
    private String userAddress;

     @Column(name = "option_id", nullable = false)
    private Long optionId;

    // not selling, not exercised
    @Column(name = "owned_amount", nullable = false)
    private Long ownedAmount;

    @Column(name = "selling_amount", nullable = false)
    private Long sellingAmount;

    @Column(name = "exercised_amount", nullable = false)
    private Long exercisedAmount;

    @Column(name = "issued_amount", nullable = false)
    private Long issuedAmount;

    @Column(name = "collateral_collected_amount", nullable = false)
    private Long collateralCollectedAmount;


}