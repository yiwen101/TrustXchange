package com.trustXchange.entities.option;

import java.sql.Timestamp;
import javax.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "option_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptionOrder  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

     @Column(name = "poster_address", nullable = false)
    private String posterAddress;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    private OptionOrderType orderType;

    @Column(name = "price", nullable = false)
    private Long price;

    @Column(name = "amount", nullable = false)
    private Long amount;

      @Column(name = "filled_amount", nullable = false)
    private Long filledAmount;

      @Column(name = "is_cancelled", nullable = false)
    private boolean isCancelled;

   @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;


    @ManyToOne
    @JoinColumn(name = "option_id", insertable = false, updatable = false,  foreignKey = @ForeignKey(name = "FK_option_orders_options"))
    private Option option;
}