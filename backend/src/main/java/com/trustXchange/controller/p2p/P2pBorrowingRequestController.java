package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pBorrowingRequest;
import com.trustXchange.repository.p2p.P2pBorrowingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/p2p/borrowing-requests")
public class P2pBorrowingRequestController  {

    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;

    @GetMapping
    public ResponseEntity<List<P2pBorrowingRequest>> getAllBorrowingRequests() {
         return ResponseEntity.ok(p2pBorrowingRequestRepository.findAll());
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<P2pBorrowingRequest> getBorrowingRequestByRequestId(@PathVariable Integer requestId) {
        Optional<P2pBorrowingRequest> borrowingRequest = p2pBorrowingRequestRepository.findById(requestId);
        return borrowingRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/borrower/{borrower}")
     public ResponseEntity<List<P2pBorrowingRequest>> getBorrowingRequestsByBorrower(@PathVariable String borrower){
          return  ResponseEntity.ok(p2pBorrowingRequestRepository.findByBorrower(borrower));
     }
}