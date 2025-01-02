package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pBorrowingRequest;
import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.service.p2p.P2pBorrowingRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/p2p/borrowing-requests")
public class P2pBorrowingRequestController {

    @Autowired
    private P2pBorrowingRequestService p2pBorrowingRequestService;

    @GetMapping("/{requestId}")
    public ResponseEntity<P2pBorrowingRequest> getBorrowingRequestById(@PathVariable Integer requestId) {
        Optional<P2pBorrowingRequest> request = p2pBorrowingRequestService.getBorrowingRequestById(requestId);
        return request.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/borrower/{borrower}")
    public ResponseEntity<List<P2pBorrowingRequest>> getBorrowingRequestsByBorrower(@PathVariable String borrower) {
        List<P2pBorrowingRequest> requests = p2pBorrowingRequestService.getBorrowingRequestsByBorrower(borrower);
        return ResponseEntity.ok(requests);
    }

    @GetMapping
    public ResponseEntity<List<P2pBorrowingRequest>> getAllBorrowingRequests() {
        List<P2pBorrowingRequest> requests = p2pBorrowingRequestService.getAllBorrowingRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{requestId}/full-loans")
      public ResponseEntity<List<P2pLoan>> getFullLoansByBorrowingRequestId(@PathVariable Integer requestId) {
        List<P2pLoan> loans = p2pBorrowingRequestService.getFullLoansByBorrowingRequestId(requestId);
          return ResponseEntity.ok(loans);
    }
}