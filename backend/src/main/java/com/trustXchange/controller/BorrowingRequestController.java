package com.trustXchange.controller;

import com.trustXchange.entity.BorrowingRequestEntity;
import com.trustXchange.repository.BorrowingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/borrowing-requests")
public class BorrowingRequestController {

    @Autowired
    private BorrowingRequestRepository borrowingRequestRepository;


    @GetMapping
    public ResponseEntity<Page<BorrowingRequestEntity>> getAllBorrowingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "requestId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder
    ){
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page,size,sort);
        Page<BorrowingRequestEntity> result = borrowingRequestRepository.findAll(pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<BorrowingRequestEntity> getBorrowingRequestById(@PathVariable int requestId){
        return borrowingRequestRepository.findById(requestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


}