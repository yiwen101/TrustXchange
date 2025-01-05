package com.trustXchange.entities.option;

import java.sql.Timestamp;
import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.trustXchange.entities.option.type.OptionType;
import com.trustXchange.entities.option.typeConvert.OptionTypeConverter;

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
public class Option   {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Convert(converter = OptionTypeConverter.class)
    @Column(name = "option_type", nullable = false)
    private OptionType optionType;

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

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;

    @Column(name = "modified_at")
    @UpdateTimestamp
    private Timestamp modifiedAt;

}