package com.trustXchange.entities.option;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "trade_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TradeEvent  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "transaction_hash", nullable = false)
    private String transactionHash;

    @Column(name = "transaction_url", nullable = false)
    private String transactionUrl;

    @Column(name = "buyer_address", nullable = false)
    private String buyerAddress;

    @Column(name = "seller_address", nullable = false)
    private String sellerAddress;

    @Column(name = "deal_price", nullable = false)
    private Long dealPrice;

     @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "sell_order_id", nullable = false)
    private Long sellOrderId;

    @Column(name = "buy_order_id", nullable = false)
    private Long buyOrderId;

}