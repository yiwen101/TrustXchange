package com.trustXchange.repository.pledge;

import com.trustXchange.entities.pledge.PoolLendingBorrowerEvents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoolLendingBorrowerEventsRepository  extends JpaRepository<PoolLendingBorrowerEvents, Long> {

}