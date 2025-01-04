package com.trustXchange.repository.pledge;

import com.trustXchange.entities.pledge.PoolLendingContributorEvents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoolLendingContributorEventsRepository  extends JpaRepository<PoolLendingContributorEvents, Long> {

}