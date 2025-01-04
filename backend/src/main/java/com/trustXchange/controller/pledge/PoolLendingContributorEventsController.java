package com.trustXchange.controller.pledge;

import com.trustXchange.entities.pledge.PoolLendingContributorEvents;
import com.trustXchange.repository.pledge.PoolLendingContributorEventsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pledge/contributor-events")
public class PoolLendingContributorEventsController {
 
    @Autowired
    private PoolLendingContributorEventsRepository poolLendingContributorEventsRepository;

    @GetMapping
    public ResponseEntity<List<PoolLendingContributorEvents>> getAllContributorEvents() {
         return ResponseEntity.ok(poolLendingContributorEventsRepository.findAll());
    }

    @GetMapping("/contributor/{contributorAddress}")
    public ResponseEntity<List<PoolLendingContributorEvents>> getContributorEventsByContributorAddress(@PathVariable String contributorAddress){
      return  ResponseEntity.ok(poolLendingContributorEventsRepository.findAll().stream()
                .filter(poolLendingContributorEvents -> poolLendingContributorEvents.getContributorAddress().equals(contributorAddress))
               .collect(Collectors.toList()));
    }
}