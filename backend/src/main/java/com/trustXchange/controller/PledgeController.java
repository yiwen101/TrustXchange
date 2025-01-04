package com.trustXchange.controller;

import com.trustXchange.entities.pledge.*;
import com.trustXchange.repository.pledge.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/pledge") // Base path for all pledge endpoints
public class PledgeController {


    // --------------------- Pool Lending Borrower Endpoints ---------------------
    @Autowired
    private PoolLendingBorrowerRepository poolLendingBorrowerRepository;

    @GetMapping("/borrowers/{borrowerAddress}")
    public ResponseEntity<PoolLendingBorrower> getBorrowerByAddress(@PathVariable String borrowerAddress) {
        Optional<PoolLendingBorrower> poolLendingBorrower = poolLendingBorrowerRepository.findById(borrowerAddress);
        return poolLendingBorrower.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --------------------- Pool Lending Borrower Event Endpoints ---------------------
    @Autowired
    private PoolLendingBorrowerEventsRepository poolLendingBorrowerEventsRepository;

    @GetMapping("/borrower-events/{borrowerAddress}")
    public ResponseEntity<List<PoolLendingBorrowerEvents>> getBorrowerEventsByBorrowerAddress(@PathVariable String borrowerAddress) {
        return ResponseEntity.ok(poolLendingBorrowerEventsRepository.findAll().stream()
                .filter(poolLendingBorrowerEvents -> poolLendingBorrowerEvents.getBorrowerAddress().equals(borrowerAddress))
                .collect(Collectors.toList()));
    }


    // --------------------- Pool Lending Contributor Endpoints ---------------------
    @Autowired
    private PoolLendingContributorRepository poolLendingContributorRepository;

    @GetMapping("/contributors/{contributorAddress}")
    public ResponseEntity<PoolLendingContributor> getContributorByAddress(@PathVariable String contributorAddress) {
        Optional<PoolLendingContributor> poolLendingContributor = poolLendingContributorRepository.findById(contributorAddress);
        return poolLendingContributor.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --------------------- Pool Lending Contributor Event Endpoints ---------------------
    @Autowired
    private PoolLendingContributorEventsRepository poolLendingContributorEventsRepository;

    @GetMapping("/contributor-events/{contributorAddress}")
    public ResponseEntity<List<PoolLendingContributorEvents>> getContributorEventsByContributorAddress(@PathVariable String contributorAddress) {
        return ResponseEntity.ok(poolLendingContributorEventsRepository.findAll().stream()
                .filter(poolLendingContributorEvents -> poolLendingContributorEvents.getContributorAddress().equals(contributorAddress))
                .collect(Collectors.toList()));
    }
    // --------------------- Pool Lending Pool Event Endpoints ---------------------
    @Autowired
    private PoolLendingPoolEventsRepository poolLendingPoolEventsRepository;

    @GetMapping("/pool-events")
    public ResponseEntity<Page<PoolLendingPoolEvents>> getAllPoolEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PoolLendingPoolEvents> poolEvents = poolLendingPoolEventsRepository.findAll(pageable);
        return ResponseEntity.ok(poolEvents);
    }
}