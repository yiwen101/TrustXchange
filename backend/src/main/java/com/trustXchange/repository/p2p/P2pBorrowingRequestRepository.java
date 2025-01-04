package com.trustXchange.repository.p2p;

import com.trustXchange.entities.p2p.P2pBorrowingRequest;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface P2pBorrowingRequestRepository extends JpaRepository<P2pBorrowingRequest, Integer> {
    List<P2pBorrowingRequest> findByBorrower(String borrower);
}