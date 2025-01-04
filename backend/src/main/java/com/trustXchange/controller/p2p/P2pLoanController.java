package com.trustXchange.controller.p2p;

import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.repository.p2p.P2pLoanRepository;
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
@RequestMapping("/p2p/loans")
public class P2pLoanController {

    @Autowired
    private P2pLoanRepository p2pLoanRepository;

    @GetMapping
    public ResponseEntity<List<P2pLoan>> getAllLoans() {
         return ResponseEntity.ok(p2pLoanRepository.findAll());
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<P2pLoan> getLoanById(@PathVariable Integer loanId) {
        Optional<P2pLoan> loan = p2pLoanRepository.findById(loanId);
          return loan.map(ResponseEntity::ok)
                 .orElse(ResponseEntity.notFound().build());
    }

     @GetMapping("/borrower/{borrower}")
     public ResponseEntity<List<P2pLoan>> getLoansByBorrower(@PathVariable String borrower){
         return ResponseEntity.ok(p2pLoanRepository.findByBorrower(borrower));
     }

    @GetMapping("/lender/{lender}")
     public ResponseEntity<List<P2pLoan>> getLoansByLender(@PathVariable String lender){
         return ResponseEntity.ok(p2pLoanRepository.findByLender(lender));
     }

    @GetMapping("/lendRequest/{lendRequestId}")
    public ResponseEntity<List<P2pLoan>> getLoansByLendRequestId(@PathVariable Integer lendRequestId) {
        return ResponseEntity.ok(p2pLoanRepository.findAll().stream()
                .filter(loan -> lendRequestId.equals(loan.getLendRequestId()))
                 .collect(Collectors.toList()));
    }

   @GetMapping("/borrowRequest/{borrowRequestId}")
   public ResponseEntity<List<P2pLoan>> getLoansByBorrowRequestId(@PathVariable Integer borrowRequestId) {
        return  ResponseEntity.ok(p2pLoanRepository.findAll().stream()
                .filter(loan -> borrowRequestId.equals(loan.getBorrowRequestId()))
                .collect(Collectors.toList()));
   }
}