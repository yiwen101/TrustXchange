package com.trustXchange.controller.pledge;

import com.trustXchange.entities.pledge.PoolLendingContributor;
import com.trustXchange.repository.pledge.PoolLendingContributorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/pledge/contributors")
public class PoolLendingContributorController  {

    @Autowired
    private PoolLendingContributorRepository poolLendingContributorRepository;

    @GetMapping
    public ResponseEntity<List<PoolLendingContributor>> getAllContributors() {
         return ResponseEntity.ok(poolLendingContributorRepository.findAll());
    }

    @GetMapping("/{contributorAddress}")
    public ResponseEntity<PoolLendingContributor> getContributorByAddress(@PathVariable String contributorAddress) {
        Optional<PoolLendingContributor> poolLendingContributor = poolLendingContributorRepository.findById(contributorAddress);
          return poolLendingContributor.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
}