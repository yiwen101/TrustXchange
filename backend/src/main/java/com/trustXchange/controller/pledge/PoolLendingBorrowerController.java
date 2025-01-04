package com.trustXchange.controller.pledge;

import com.trustXchange.entities.pledge.PoolLendingBorrower;
import com.trustXchange.repository.pledge.PoolLendingBorrowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/pledge/borrowers")
public class PoolLendingBorrowerController  {

    @Autowired
    private PoolLendingBorrowerRepository poolLendingBorrowerRepository;

    @GetMapping
    public ResponseEntity<List<PoolLendingBorrower>> getAllBorrowers() {
           return ResponseEntity.ok(poolLendingBorrowerRepository.findAll());
    }

    @GetMapping("/{borrowerAddress}")
    public ResponseEntity<PoolLendingBorrower> getBorrowerByAddress(@PathVariable String borrowerAddress) {
        Optional<PoolLendingBorrower> poolLendingBorrower = poolLendingBorrowerRepository.findById(borrowerAddress);
         return poolLendingBorrower.map(ResponseEntity::ok)
                 .orElse(ResponseEntity.notFound().build());
    }
}