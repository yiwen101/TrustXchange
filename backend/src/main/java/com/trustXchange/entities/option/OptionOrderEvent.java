package com.trustXchange.entities.option;

import java.sql.Timestamp;
import javax.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import com.trustXchange.entities.option.type.OptionTradeEventType;
import com.trustXchange.entities.option.typeConvert.OptionTradeEventTypeConverter;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "option_order_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptionOrderEvent  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long id;

    @Column(name = "transaction_hash", nullable = false)
    private String transactionHash;

    @Column(name = "transaction_url", nullable = false)
    private String transactionUrl;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "poster_address", nullable = false)
    private String posterAddress;


    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "deal_price", nullable = false)
    private Long dealPrice;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Convert(converter = OptionTradeEventTypeConverter.class)
    @Column(name = "action", nullable = false)
    private OptionTradeEventType action;

   @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;
    
    @ManyToOne
    @JoinColumn(name = "option_id", insertable = false, updatable = false,  foreignKey = @ForeignKey(name = "FK_option_order_events_options"))
    private Option option;

}