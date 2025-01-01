package com.trustXchange.repository;

import com.trustXchange.entity.LendingRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LendingRequestRepository extends JpaRepository<LendingRequestEntity, Integer> {
}