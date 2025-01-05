package com.trustXchange.entities.option;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "option_buy_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BuyOrder  {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "buyer_address", nullable = false)
    private String buyerAddress;

    @Column(name = "price", nullable = false)
    private Long price;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "filled_amount", nullable = false)
    private Long filledAmount;

    @Column(name = "is_cancelled", nullable = false)
    private Boolean isCancelled = false;
}