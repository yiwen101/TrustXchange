package com.trustXchange.service.p2p;

import com.trustXchange.entities.p2p.P2pBorrowingRequest;
import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.repository.p2p.P2pBorrowingRequestRepository;
import com.trustXchange.repository.p2p.P2pLoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class P2pBorrowingRequestService {

    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;
    @Autowired
    private P2pLoanRepository p2pLoanRepository;

    public Optional<P2pBorrowingRequest> getBorrowingRequestById(Integer id) {
        return p2pBorrowingRequestRepository.findById(id);
    }

    public List<P2pBorrowingRequest> getBorrowingRequestsByBorrower(String borrower) {
        return p2pBorrowingRequestRepository.findByBorrower(borrower);
    }

    public List<P2pBorrowingRequest> getAllBorrowingRequests() {
        return p2pBorrowingRequestRepository.findAll();
    }

    public List<P2pLoan> getFullLoansByBorrowingRequestId(Integer requestId) {
        return p2pLoanRepository.findAll().stream()
           .filter(loan -> p2pBorrowingRequestRepository.findById(requestId).isPresent() &&
                 loan.getBorrower().equals(p2pBorrowingRequestRepository.findById(requestId).get().getBorrower()))
            .collect(Collectors.toList());
    }
}