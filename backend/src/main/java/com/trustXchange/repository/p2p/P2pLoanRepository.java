package com.trustXchange.repository.p2p;

import com.trustXchange.entities.p2p.P2pLoan;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface P2pLoanRepository extends JpaRepository<P2pLoan, Integer> {
    List<P2pLoan> findByBorrower(String borrower);
    List<P2pLoan> findByLender(String lender);
}