package com.trustXchange.controller.pledge;

import com.trustXchange.entities.pledge.PoolLendingBorrowerEvents;
import com.trustXchange.repository.pledge.PoolLendingBorrowerEventsRepository;
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
@RequestMapping("/pledge/borrower-events")
public class PoolLendingBorrowerEventsController  {

    @Autowired
    private PoolLendingBorrowerEventsRepository poolLendingBorrowerEventsRepository;

    @GetMapping
    public ResponseEntity<List<PoolLendingBorrowerEvents>> getAllBorrowerEvents() {
         return ResponseEntity.ok(poolLendingBorrowerEventsRepository.findAll());
    }

    @GetMapping("/borrower/{borrowerAddress}")
   public ResponseEntity<List<PoolLendingBorrowerEvents>> getBorrowerEventsByBorrowerAddress(@PathVariable String borrowerAddress){
       return ResponseEntity.ok(poolLendingBorrowerEventsRepository.findAll().stream()
                .filter(poolLendingBorrowerEvents -> poolLendingBorrowerEvents.getBorrowerAddress().equals(borrowerAddress))
                .collect(Collectors.toList()));
   }
}