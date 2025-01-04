package com.trustXchange.entities.option;

import javax.persistence.*;
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
    @Column(name = "id")
    private Long id;

    @Column(name = "transaction_hash", nullable = false)
    private String transactionHash;

    @Column(name = "transaction_url", nullable = false)
    private String transactionUrl;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "amount", nullable = false)
    private Long amount;

}