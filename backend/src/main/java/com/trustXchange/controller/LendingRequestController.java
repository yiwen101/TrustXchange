package com.trustXchange.controller;

import com.trustXchange.entity.LendingRequestEntity;
import com.trustXchange.repository.LendingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lending-requests")
public class LendingRequestController {

    @Autowired
    private LendingRequestRepository lendingRequestRepository;


    @GetMapping
    public ResponseEntity<Page<LendingRequestEntity>> getAllLendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "requestId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder
    ){
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page,size,sort);
        Page<LendingRequestEntity> result = lendingRequestRepository.findAll(pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<LendingRequestEntity> getLendingRequestById(@PathVariable int requestId){
        return lendingRequestRepository.findById(requestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}