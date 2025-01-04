package com.trustXchange.repository.p2p;

import com.trustXchange.entities.p2p.P2pLendingRequest;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface P2pLendingRequestRepository extends JpaRepository<P2pLendingRequest, Integer> {
    List<P2pLendingRequest> findByLender(String lender);
}