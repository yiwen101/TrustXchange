package com.trustXchange.controller;

import com.trustXchange.entity.LoanEntity;
import com.trustXchange.repository.LoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loans")
public class LoanController {

    @Autowired
    private LoanRepository loanRepository;

    @GetMapping
    public ResponseEntity<Page<LoanEntity>> getAllLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "loanId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder
    ){
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page,size,sort);
        Page<LoanEntity> result = loanRepository.findAll(pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<LoanEntity> getLoanById(@PathVariable int loanId){
        return loanRepository.findById(loanId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/list/{loanIds}")
    public ResponseEntity<List<LoanEntity>> getLoansByIds(@PathVariable List<Integer> loanIds) {
        List<LoanEntity> loans = loanRepository.findAllByLoanIdIn(loanIds);
        return ResponseEntity.ok(loans);

    }

    @GetMapping("/borrower/{borrowerAddress}")
    public ResponseEntity<List<LoanEntity>> getLoansByBorrower(@PathVariable String borrowerAddress) {
        return ResponseEntity.ok(loanRepository.findByBorrower(borrowerAddress));
    }

    @GetMapping("/lender/{lenderAddress}")
    public ResponseEntity<List<LoanEntity>> getLoansByLender(@PathVariable String lenderAddress) {
        return ResponseEntity.ok(loanRepository.findByLender(lenderAddress));
    }
}