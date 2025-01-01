package com.trustXchange.repository;

import com.trustXchange.entity.P2PBorrowingRequestFilledEntity;
import com.trustXchange.entity.P2PBorrowingRequestFilledId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface P2PBorrowingRequestFilledRepository extends JpaRepository<P2PBorrowingRequestFilledEntity, P2PBorrowingRequestFilledId> {
    List<P2PBorrowingRequestFilledEntity> findAllByRequestId(int requestId);

}