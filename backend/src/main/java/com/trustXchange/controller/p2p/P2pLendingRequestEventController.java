package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pLendingRequestEvent;
import com.trustXchange.repository.p2p.P2pLendingRequestEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/p2p/lending-request-events")
public class P2pLendingRequestEventController {

    @Autowired
    private P2pLendingRequestEventRepository p2pLendingRequestEventRepository;

    @GetMapping
    public ResponseEntity<List<P2pLendingRequestEvent>> getAllLendingRequestEvents() {
        return ResponseEntity.ok(p2pLendingRequestEventRepository.findAll());
    }

    @GetMapping("/request/{requestId}")
     public ResponseEntity<List<P2pLendingRequestEvent>> getLendingRequestEventsByRequestId(@PathVariable Integer requestId) {
            return ResponseEntity.ok(p2pLendingRequestEventRepository.findAll().stream()
                    .filter(lendingRequestEvent -> lendingRequestEvent.getRequestId().equals(requestId))
                    .collect(Collectors.toList()));
    }
}