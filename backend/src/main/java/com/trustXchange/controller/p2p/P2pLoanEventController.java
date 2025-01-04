package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pLoanEvent;
import com.trustXchange.repository.p2p.P2pLoanEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/p2p/loan-events")
public class P2pLoanEventController {

    @Autowired
    private P2pLoanEventRepository p2pLoanEventRepository;

    @GetMapping
    public ResponseEntity<List<P2pLoanEvent>> getAllLoanEvents() {
           return ResponseEntity.ok(p2pLoanEventRepository.findAll());
    }

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<P2pLoanEvent>> getLoanEventsByLoanId(@PathVariable Integer loanId) {
         return ResponseEntity.ok(p2pLoanEventRepository.findAll().stream()
                 .collect(Collectors.toList()));
    }
}