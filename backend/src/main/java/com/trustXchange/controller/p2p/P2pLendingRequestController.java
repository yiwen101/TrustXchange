package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pLendingRequest;
import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.service.p2p.P2pLendingRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/p2p/lending-requests")
public class P2pLendingRequestController {

    @Autowired
    private P2pLendingRequestService p2pLendingRequestService;

    @GetMapping("/{requestId}")
    public ResponseEntity<P2pLendingRequest> getLendingRequestById(@PathVariable Integer requestId) {
        Optional<P2pLendingRequest> request = p2pLendingRequestService.getLendingRequestById(requestId);
        return request.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

   @GetMapping("/lender/{lender}")
    public ResponseEntity<List<P2pLendingRequest>> getLendingRequestsByLender(@PathVariable String lender) {
        List<P2pLendingRequest> requests = p2pLendingRequestService.getLendingRequestsByLender(lender);
        return ResponseEntity.ok(requests);
    }


    @GetMapping
    public ResponseEntity<List<P2pLendingRequest>> getAllLendingRequests() {
        List<P2pLendingRequest> requests = p2pLendingRequestService.getAllLendingRequests();
        return ResponseEntity.ok(requests);
    }

     @GetMapping("/{requestId}/full-loans")
     public ResponseEntity<List<P2pLoan>> getFullLoansByLendingRequestId(@PathVariable Integer requestId) {
         List<P2pLoan> loans = p2pLendingRequestService.getFullLoansByLendingRequestId(requestId);
          return ResponseEntity.ok(loans);
     }
}