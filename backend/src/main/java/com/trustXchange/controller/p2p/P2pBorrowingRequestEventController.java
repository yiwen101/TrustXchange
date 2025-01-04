package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pBorrowingRequestEvent;
import com.trustXchange.repository.p2p.P2pBorrowingRequestEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/p2p/borrowing-request-events")
public class P2pBorrowingRequestEventController {

    @Autowired
    private P2pBorrowingRequestEventRepository p2pBorrowingRequestEventRepository;

    @GetMapping
     public ResponseEntity<List<P2pBorrowingRequestEvent>> getAllBorrowingRequestEvents() {
        return ResponseEntity.ok(p2pBorrowingRequestEventRepository.findAll());
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<P2pBorrowingRequestEvent>> getBorrowingRequestEventsByRequestId(@PathVariable Integer requestId) {
          return ResponseEntity.ok(p2pBorrowingRequestEventRepository.findAll().stream()
                  .filter(borrowingRequestEvent -> borrowingRequestEvent.getRequestId().equals(requestId))
                  .collect(Collectors.toList()));
    }
}