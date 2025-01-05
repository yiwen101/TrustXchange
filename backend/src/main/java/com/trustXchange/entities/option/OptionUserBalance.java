package com.trustXchange.entities.option;

import java.sql.Timestamp;
import javax.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "option_user_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptionUserBalance  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_address", nullable = false)
    private String userAddress;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

     @Column(name = "owned_amount", nullable = false)
    private Long ownedAmount;

     @Column(name = "selling_amount", nullable = false)
    private Long sellingAmount;

     @Column(name = "exercised_amount", nullable = false)
    private Long exercisedAmount;

    @Column(name = "issued_amount", nullable = false)
    private Long issuedAmount;

    @Column(name = "collateral_collected_amount", nullable = false)
    private Long collateralCollectedAmount;


    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;

    @Column(name = "modified_at")
    @UpdateTimestamp
    private Timestamp modifiedAt;
    
    @ManyToOne
    @JoinColumn(name = "option_id", insertable = false, updatable = false,  foreignKey = @ForeignKey(name = "FK_option_user_balances_options"))
    private Option option;

}