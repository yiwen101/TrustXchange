package com.trustXchange.entities.option;

import java.sql.Timestamp;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Option  {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "option_seq")
    @SequenceGenerator(name = "option_seq", sequenceName = "option_sequence", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    @Column(name = "option_type", nullable = false)
    private String optionType;

    @Column(name = "strike_price", nullable = false)
    private Long strikePrice;

    @Column(name = "expiry_date", nullable = false)
    private Timestamp expiryDate;

     @Column(name = "late_deal_price")
    private Long lateDealPrice;

    @Column(name = "first_bid")
    private Long firstBid;

    @Column(name = "first_bid_amount")
    private Long firstBidAmount;

     @Column(name = "first_ask")
    private Long firstAsk;

    @Column(name = "first_ask_amount")
    private Long firstAskAmount;

    @Column(name = "daily_volume")
    private Long dailyVolume;

}