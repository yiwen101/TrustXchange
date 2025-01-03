package com.trustXchange.entities.pledge;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "pool_lending_pool_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PoolLendingPoolEvents  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reward_distributed")
    private Long rewardDistributed;

    @Column(name = "acc_reward_per_share_e18")
    private Long accRewardPerShareE18;

    @Column(name = "equity")
    private Long equity;

    @Column(name = "retained_earning")
    private Long retainedEarning;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

}