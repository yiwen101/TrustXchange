package com.trustXchange.service.p2p;

import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.repository.p2p.P2pLoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class P2pLoanService {

    @Autowired
    private P2pLoanRepository p2pLoanRepository;


    public List<P2pLoan> getAllLoans() {
        return p2pLoanRepository.findAll();
    }

    public List<P2pLoan> getLoansByBorrower(String borrower) {
        return p2pLoanRepository.findByBorrower(borrower);
    }

    public List<P2pLoan> getLoansByLender(String lender) {
        return p2pLoanRepository.findByLender(lender);
    }
}