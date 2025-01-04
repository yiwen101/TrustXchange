package com.trustXchange.repository.pledge;

import com.trustXchange.entities.pledge.PoolLendingContributor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoolLendingContributorRepository  extends JpaRepository<PoolLendingContributor, String> {

}