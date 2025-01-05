package com.trustXchange.entities.option;

import java.sql.Timestamp;
import javax.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "option_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptionEvent  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_hash", nullable = false)
    private String transactionHash;

    @Column(name = "transaction_url", nullable = false)
    private String transactionUrl;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private OptionActionType action;

    @Column(name = "amount", nullable = false)
    private Long amount;

   @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;


    @ManyToOne
    @JoinColumn(name = "option_id", insertable = false, updatable = false,  foreignKey = @ForeignKey(name = "FK_option_events_options"))
    private Option option;
}