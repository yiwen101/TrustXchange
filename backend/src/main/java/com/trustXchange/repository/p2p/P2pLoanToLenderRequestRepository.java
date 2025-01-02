package com.trustXchange.repository.p2p;

import com.trustXchange.entities.p2p.P2pLoanToLenderRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface P2pLoanToLenderRequestRepository extends JpaRepository<P2pLoanToLenderRequest, Integer> {
}
