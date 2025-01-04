package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pLendingRequest;
import com.trustXchange.repository.p2p.P2pLendingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/p2p/lending-requests")
public class P2pLendingRequestController  {

    @Autowired
    private P2pLendingRequestRepository p2pLendingRequestRepository;

    @GetMapping
    public ResponseEntity<List<P2pLendingRequest>> getAllLendingRequests() {
           return ResponseEntity.ok(p2pLendingRequestRepository.findAll());
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<P2pLendingRequest> getLendingRequestById(@PathVariable Integer requestId) {
        Optional<P2pLendingRequest> lendingRequest = p2pLendingRequestRepository.findById(requestId);
        return lendingRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lender/{lender}")
     public ResponseEntity<List<P2pLendingRequest>> getLendingRequestsByLender(@PathVariable String lender){
         return ResponseEntity.ok(p2pLendingRequestRepository.findByLender(lender));
     }
}