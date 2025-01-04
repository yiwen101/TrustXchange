package com.trustXchange.repository.pledge;

import com.trustXchange.entities.pledge.PoolLendingPoolEvents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoolLendingPoolEventsRepository  extends JpaRepository<PoolLendingPoolEvents, Long> {

}