package com.trustXchange.entities.pledge;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "pool_lending_contributor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PoolLendingContributor  {

    @Id
    @Column(name = "address")
    private String address;

    @Column(name = "contribution_balance", nullable = false)
    private Long contributionBalance;

    @Column(name = "reward_debt", nullable = false)
    private Long rewardDebt;

    @Column(name = "confirmed_rewards", nullable = false)
    private Long confirmedRewards;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;
}