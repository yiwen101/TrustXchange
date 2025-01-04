package com.trustXchange.controller;

import com.trustXchange.entities.p2p.*;
import com.trustXchange.repository.p2p.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/p2p") // Base path for all p2p endpoints
public class P2pController {

    // --------------------- Borrowing Request Endpoints ---------------------
    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;

    @GetMapping("/borrowing-requests")
    public ResponseEntity<List<P2pBorrowingRequest>> getAllBorrowingRequests() {
        return ResponseEntity.ok(p2pBorrowingRequestRepository.findAll());
    }

    @GetMapping("/borrowing-requests/{requestId}")
    public ResponseEntity<P2pBorrowingRequest> getBorrowingRequestByRequestId(@PathVariable Integer requestId) {
        Optional<P2pBorrowingRequest> borrowingRequest = p2pBorrowingRequestRepository.findById(requestId);
        return borrowingRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/borrowing-requests/borrower/{borrower}")
    public ResponseEntity<List<P2pBorrowingRequest>> getBorrowingRequestsByBorrower(@PathVariable String borrower) {
        return ResponseEntity.ok(p2pBorrowingRequestRepository.findByBorrower(borrower));
    }


    // --------------------- Borrowing Request Event Endpoints ---------------------
    @Autowired
    private P2pBorrowingRequestEventRepository p2pBorrowingRequestEventRepository;

    @GetMapping("/borrowing-request-events/{requestId}")
    public ResponseEntity<List<P2pBorrowingRequestEvent>> getBorrowingRequestEventsByRequestId(@PathVariable Integer requestId) {
        return ResponseEntity.ok(p2pBorrowingRequestEventRepository.findAll().stream()
                .filter(borrowingRequestEvent -> borrowingRequestEvent.getRequestId().equals(requestId))
                .collect(Collectors.toList()));
    }

    // --------------------- Lending Request Endpoints ---------------------
    @Autowired
    private P2pLendingRequestRepository p2pLendingRequestRepository;

    @GetMapping("/lending-requests")
    public ResponseEntity<List<P2pLendingRequest>> getAllLendingRequests() {
        return ResponseEntity.ok(p2pLendingRequestRepository.findAll());
    }

    @GetMapping("/lending-requests/{requestId}")
    public ResponseEntity<P2pLendingRequest> getLendingRequestById(@PathVariable Integer requestId) {
        Optional<P2pLendingRequest> lendingRequest = p2pLendingRequestRepository.findById(requestId);
        return lendingRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lending-requests/lender/{lender}")
    public ResponseEntity<List<P2pLendingRequest>> getLendingRequestsByLender(@PathVariable String lender) {
        return ResponseEntity.ok(p2pLendingRequestRepository.findByLender(lender));
    }


    // --------------------- Lending Request Event Endpoints ---------------------
    @Autowired
    private P2pLendingRequestEventRepository p2pLendingRequestEventRepository;

    @GetMapping("/lending-request-events/{requestId}")
    public ResponseEntity<List<P2pLendingRequestEvent>> getLendingRequestEventsByRequestId(@PathVariable Integer requestId) {
        return ResponseEntity.ok(p2pLendingRequestEventRepository.findAll().stream()
                .filter(lendingRequestEvent -> lendingRequestEvent.getRequestId().equals(requestId))
                .collect(Collectors.toList()));
    }

    // --------------------- Loan Endpoints ---------------------
    @Autowired
    private P2pLoanRepository p2pLoanRepository;

    @GetMapping("/loans/{loanId}")
    public ResponseEntity<P2pLoan> getLoanById(@PathVariable Integer loanId) {
        Optional<P2pLoan> loan = p2pLoanRepository.findById(loanId);
        return loan.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/loans/borrower/{borrower}")
    public ResponseEntity<List<P2pLoan>> getLoansByBorrower(@PathVariable String borrower) {
        return ResponseEntity.ok(p2pLoanRepository.findByBorrower(borrower));
    }

    @GetMapping("/loans/lender/{lender}")
    public ResponseEntity<List<P2pLoan>> getLoansByLender(@PathVariable String lender) {
        return ResponseEntity.ok(p2pLoanRepository.findByLender(lender));
    }

    @GetMapping("/loans/lendRequest/{lendRequestId}")
    public ResponseEntity<List<P2pLoan>> getLoansByLendRequestId(@PathVariable Integer lendRequestId) {
        return ResponseEntity.ok(p2pLoanRepository.findAll().stream()
                .filter(loan -> lendRequestId.equals(loan.getLendRequestId()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/loans/borrowRequest/{borrowRequestId}")
    public ResponseEntity<List<P2pLoan>> getLoansByBorrowRequestId(@PathVariable Integer borrowRequestId) {
        return ResponseEntity.ok(p2pLoanRepository.findAll().stream()
                .filter(loan -> borrowRequestId.equals(loan.getBorrowRequestId()))
                .collect(Collectors.toList()));
    }

    // --------------------- Loan Event Endpoints ---------------------
    @Autowired
    private P2pLoanEventRepository p2pLoanEventRepository;

    @GetMapping("/loan-events/loan/{loanId}")
    public ResponseEntity<List<P2pLoanEvent>> getLoanEventsByLoanId(@PathVariable Integer loanId) {
      return   ResponseEntity.ok(p2pLoanEventRepository.findAll().stream().
              filter(loanEvent -> loanEvent.getLoanId().equals(loanId)).
              collect(Collectors.toList()));
    }

}