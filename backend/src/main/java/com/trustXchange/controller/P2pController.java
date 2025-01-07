package com.trustXchange.controller;

import com.trustXchange.entities.p2p.*;
import com.trustXchange.repository.p2p.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("api/p2p")
public class P2pController {


    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;

    @Autowired
    private P2pLendingRequestRepository p2pLendingRequestRepository;

    @Autowired
    private P2pLoanRepository p2pLoanRepository;
    @Autowired
    private P2pLoanEventRepository p2pLoanEventRepository;
    @Autowired
    private P2pBorrowingRequestEventRepository p2pBorrowingRequestEventRepository;
    @Autowired
    private P2pLendingRequestEventRepository p2pLendingRequestEventRepository;

    // 1. Get all borrow and lend requests
    @GetMapping("/requests")
    public ResponseEntity<AllRequestsResponse> getAllRequests() {
        List<P2pBorrowingRequest> borrowRequests = p2pBorrowingRequestRepository.findAll();
        List<P2pLendingRequest> lendRequests = p2pLendingRequestRepository.findAll();
        return ResponseEntity.ok(new AllRequestsResponse(borrowRequests, lendRequests));
    }

    // 2. Get all loans by address (borrower or lender)
    @GetMapping("/loans/address/{address}")
    public ResponseEntity<List<P2pLoan>> getLoansByAddress(@PathVariable String address) {
        List<P2pLoan> loans = p2pLoanRepository.findAll().stream()
                .filter(loan -> loan.getBorrower().equalsIgnoreCase(address) || loan.getLender().equalsIgnoreCase(address))
                .collect(Collectors.toList());
        return ResponseEntity.ok(loans);
    }

    // 3. Get all events related to an address
    @GetMapping("/events/address/{address}")
    public ResponseEntity<AllEventsResponse> getEventsByAddress(@PathVariable String address) {
        List<P2pLoanEvent> loanEvents = p2pLoanEventRepository.findAll().stream().filter(loanEvent -> {
            P2pLoan loan = loanEvent.getP2pLoan();
             return loan !=null && (loan.getBorrower().equalsIgnoreCase(address) || loan.getLender().equalsIgnoreCase(address));
        }).collect(Collectors.toList());
        List<P2pBorrowingRequestEvent> borrowRequestEvents = p2pBorrowingRequestEventRepository.findAll().stream().filter(borrowingRequestEvent -> {
              P2pBorrowingRequest request = borrowingRequestEvent.getP2pBorrowingRequest();
            return request !=null && request.getBorrower().equalsIgnoreCase(address);
        }).collect(Collectors.toList());
        List<P2pLendingRequestEvent> lendRequestEvents = p2pLendingRequestEventRepository.findAll().stream().filter(lendingRequestEvent -> {
            P2pLendingRequest request = lendingRequestEvent.getP2pLendingRequest();
            return request!=null && request.getLender().equalsIgnoreCase(address);
        }).collect(Collectors.toList());


        return ResponseEntity.ok(new AllEventsResponse(loanEvents, borrowRequestEvents, lendRequestEvents));
    }




    // DTO classes
    static class AllRequestsResponse {
        private List<P2pBorrowingRequest> borrowRequests;
        private List<P2pLendingRequest> lendRequests;

        public AllRequestsResponse(List<P2pBorrowingRequest> borrowRequests, List<P2pLendingRequest> lendRequests) {
            this.borrowRequests = borrowRequests;
            this.lendRequests = lendRequests;
        }

        public List<P2pBorrowingRequest> getBorrowRequests() {
            return borrowRequests;
        }

        public List<P2pLendingRequest> getLendRequests() {
            return lendRequests;
        }
    }

    static class AllEventsResponse{
        private List<P2pLoanEvent> loanEvents;
        private List<P2pBorrowingRequestEvent> borrowRequestEvents;
        private List<P2pLendingRequestEvent> lendRequestEvents;
        public AllEventsResponse(List<P2pLoanEvent> loanEvents, List<P2pBorrowingRequestEvent> borrowRequestEvents, List<P2pLendingRequestEvent> lendRequestEvents){
            this.loanEvents=loanEvents;
            this.borrowRequestEvents = borrowRequestEvents;
            this.lendRequestEvents = lendRequestEvents;
        }

        public List<P2pLoanEvent> getLoanEvents() {
            return loanEvents;
        }

        public List<P2pBorrowingRequestEvent> getBorrowRequestEvents() {
            return borrowRequestEvents;
        }

        public List<P2pLendingRequestEvent> getLendRequestEvents() {
            return lendRequestEvents;
        }
    }
}