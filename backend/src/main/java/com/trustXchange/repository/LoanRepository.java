package com.trustXchange.repository;

import com.trustXchange.entity.LoanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<LoanEntity, Integer> {
    List<LoanEntity> findByBorrower(String borrower);
    List<LoanEntity> findByLender(String lender);
    List<LoanEntity> findAllByLoanIdIn(List<Integer> loanIds);
}