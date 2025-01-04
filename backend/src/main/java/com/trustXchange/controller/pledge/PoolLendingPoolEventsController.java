package com.trustXchange.controller.pledge;

import com.trustXchange.entities.pledge.PoolLendingPoolEvents;
import com.trustXchange.repository.pledge.PoolLendingPoolEventsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pledge/pool-events")
public class PoolLendingPoolEventsController  {

    @Autowired
    private PoolLendingPoolEventsRepository poolLendingPoolEventsRepository;

    // Method to get all pool events with pagination
    @GetMapping
    public ResponseEntity<Page<PoolLendingPoolEvents>> getAllPoolEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PoolLendingPoolEvents> poolEvents = poolLendingPoolEventsRepository.findAll(pageable);
        return ResponseEntity.ok(poolEvents);
    }
}