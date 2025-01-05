package com.trustXchange.entities.option;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sell_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SellOrder  {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "seller_address", nullable = false)
    private String sellerAddress;

    @Column(name = "price", nullable = false)
    private Long price;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "filled_amount", nullable = false)
    private Long filledAmount;

    @Column(name = "is_cancelled", nullable = false)
    private Boolean isCancelled = false;

}