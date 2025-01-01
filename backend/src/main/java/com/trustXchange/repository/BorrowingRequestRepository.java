package com.trustXchange.repository;

import com.trustXchange.entity.BorrowingRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BorrowingRequestRepository extends JpaRepository<BorrowingRequestEntity, Integer> {
}