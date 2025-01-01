package com.trustXchange.repository;

import com.trustXchange.entity.P2PBorrowingRequestFilledEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface P2PBorrowingRequestFilledRepository extends JpaRepository<P2PBorrowingRequestFilledEntity, Integer> {
    List<P2PBorrowingRequestFilledEntity> findAllByRequestId(int requestId);

}