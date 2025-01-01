package com.trustXchange.controller;


import com.trustXchange.entity.LoanEntity;
import com.trustXchange.entity.P2PLendingRequestFilledEntity;
import com.trustXchange.repository.LoanRepository;
import com.trustXchange.repository.P2PLendingRequestFilledRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/lending-requests/{requestId}/loans")
public class LendingRequestLoanController {

    @Autowired
    private P2PLendingRequestFilledRepository p2pLendingRequestFilledRepository;

    @Autowired
    private LoanRepository loanRepository;

    @GetMapping
    public ResponseEntity<List<Integer>> getLoanIdsByRequestId(@PathVariable int requestId) {
        List<P2PLendingRequestFilledEntity> filled = p2pLendingRequestFilledRepository.findAllByRequestId(requestId);
        List<Integer> loanIds = filled.stream().map(P2PLendingRequestFilledEntity::getLoanId).collect(Collectors.toList());
        return ResponseEntity.ok(loanIds);
    }

    @GetMapping("/full")
    public ResponseEntity<List<LoanEntity>> getFullLoansByRequestId(@PathVariable int requestId) {
        List<P2PLendingRequestFilledEntity> filled = p2pLendingRequestFilledRepository.findAllByRequestId(requestId);
        List<Integer> loanIds = filled.stream().map(P2PLendingRequestFilledEntity::getLoanId).collect(Collectors.toList());
        return ResponseEntity.ok(loanRepository.findAllByLoanIdIn(loanIds));
    }

}