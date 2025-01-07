package com.trustXchange.controller;

import com.trustXchange.entities.pledge.*;
import com.trustXchange.repository.pledge.*;
import com.trustXchange.service.pledge.eventData.BorrowerEventData;

import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("api/pledge") // Base path for all pledge endpoints
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
    @Autowired
    private PoolLendingBorrowerEventsRepository poolLendingBorrowerEventsRepository;

    @GetMapping("/events/{address}")
    public ResponseEntity<List<PoolEvents>> getEventsByAddress(@PathVariable String address) {
        List<PoolEvents> lendings = poolLendingContributorEventsRepository.findAll().stream()
                .filter(poolLendingContributorEvents -> poolLendingContributorEvents.getContributorAddress().equals(address))
                .map(PoolEvents::new)
                .collect(Collectors.toList());
        List<PoolEvents> borrowings = poolLendingBorrowerEventsRepository.findAll().stream()
                .filter(poolLendingBorrowerEvents -> poolLendingBorrowerEvents.getBorrowerAddress().equals(address))
                .map(PoolEvents::new)
                .collect(Collectors.toList());
        lendings.addAll(borrowings);
        List<PoolEvents> sortedEvents = lendings.stream()
                .sorted((event1, event2) -> event2.createdAt.compareTo(event1.createdAt))
                .collect(Collectors.toList());
            
        return ResponseEntity.ok(sortedEvents);
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

class PoolEvents {
    public String transactionHash;
    public String transactionUrl;
    public String type;
    public String eventName;
    public Long amount;
    public String borrowerAddress;
    public Timestamp createdAt;

    PoolEvents(PoolLendingBorrowerEvents borrowerEventData) {
        this.type = "borrow";
        this.transactionHash = borrowerEventData.getTransactionHash();
        this.transactionUrl = borrowerEventData.getTransactionUrl();
        this.eventName = borrowerEventData.getEventName();
        this.amount = borrowerEventData.getAmount().longValue();
        this.borrowerAddress = borrowerEventData.getBorrowerAddress();
        this.createdAt = borrowerEventData.getCreatedAt();
    }

    PoolEvents(PoolLendingContributorEvents contributorEventData) {
        this.type = "lend";
        this.transactionHash = contributorEventData.getTransactionHash();
        this.transactionUrl = contributorEventData.getTransactionUrl();
        this.eventName = contributorEventData.getEventName();
        this.amount = contributorEventData.getAmount().longValue();
        this.borrowerAddress = contributorEventData.getContributorAddress();
        this.createdAt = contributorEventData.getCreatedAt();
    }
}