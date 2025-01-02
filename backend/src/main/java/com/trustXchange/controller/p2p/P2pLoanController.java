package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.service.p2p.P2pLoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/p2p/loans")
public class P2pLoanController {

    @Autowired
    private P2pLoanService p2pLoanService;

    @GetMapping
    public ResponseEntity<List<P2pLoan>> getAllLoans() {
        List<P2pLoan> loans = p2pLoanService.getAllLoans();
        return ResponseEntity.ok(loans);
    }

    @GetMapping("/borrower/{borrower}")
    public ResponseEntity<List<P2pLoan>> getLoansByBorrower(@PathVariable String borrower) {
        List<P2pLoan> loans = p2pLoanService.getLoansByBorrower(borrower);
        return ResponseEntity.ok(loans);
    }


    @GetMapping("/lender/{lender}")
      public ResponseEntity<List<P2pLoan>> getLoansByLender(@PathVariable String lender) {
        List<P2pLoan> loans = p2pLoanService.getLoansByLender(lender);
          return ResponseEntity.ok(loans);
    }
}