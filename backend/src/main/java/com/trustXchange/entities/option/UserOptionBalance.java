package com.trustXchange.entities.option;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_option_balances")
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

    @Column(name = "owned_amount", nullable = false)
    private Long ownedAmount;

    @Column(name = "issued_amount", nullable = false)
    private Long issuedAmount;

    @Column(name = "selling_amount", nullable = false)
    private Long sellingAmount;
}