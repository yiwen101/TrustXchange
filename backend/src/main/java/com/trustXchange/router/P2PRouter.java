package com.trustXchange.router;

import com.trustXchange.dao.p2p.BorrowingRequestDAO;
import com.trustXchange.dao.p2p.LendingRequestDAO;
import com.trustXchange.dao.p2p.LoanDAO;
import com.trustXchange.dao.PriceUpdateDAO;
import com.trustXchange.dto.p2p.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class P2PRouter {

    private LendingRequestDAO lendingRequestDAO;
    private BorrowingRequestDAO borrowingRequestDAO;
    private LoanDAO loanDAO;
    private PriceUpdateDAO priceUpdateDAO;

    @Autowired
    public P2PRouter() throws SQLException {
        Connection connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/yourdatabase", "yourusername", "yourpassword");
        this.lendingRequestDAO = new LendingRequestDAO(connection);
        this.borrowingRequestDAO = new BorrowingRequestDAO(connection);
        this.loanDAO = new LoanDAO(connection);
        this.priceUpdateDAO = new PriceUpdateDAO(connection);
    }

    @PostMapping("/lending-requests")
    public ResponseEntity<Void> createLendingRequest(@RequestBody LendingRequestCreatedDTO request) {
        try {
            lendingRequestDAO.createLendingRequest(request);
            return ResponseEntity.ok().build();
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/lending-requests")
    public ResponseEntity<List<LendingRequestCreatedDTO>> getAllLendingRequests() {
        try {
            List<LendingRequestCreatedDTO> requests = lendingRequestDAO.getAllLendingRequests();
            return ResponseEntity.ok(requests);
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/lending-requests/{requestId}")
    public ResponseEntity<Void> cancelLendingRequest(@PathVariable int requestId) {
        try {
            lendingRequestDAO.cancelLendingRequest(requestId);
            return ResponseEntity.ok().build();
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/borrowing-requests")
    public ResponseEntity<Void> createBorrowingRequest(@RequestBody BorrowingRequestCreatedDTO request) {
        try {
            borrowingRequestDAO.createBorrowingRequest(request);
            return ResponseEntity.ok().build();
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/borrowing-requests")
    public ResponseEntity<List<BorrowingRequestCreatedDTO>> getAllBorrowingRequests() {
        try {
            List<BorrowingRequestCreatedDTO> requests = borrowingRequestDAO.getAllBorrowingRequests();
            return ResponseEntity.ok(requests);
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/borrowing-requests/{requestId}")
    public ResponseEntity<Void> cancelBorrowingRequest(@PathVariable int requestId) {
        try {
            borrowingRequestDAO.cancelBorrowingRequest(requestId);
            return ResponseEntity.ok().build();
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/loans/{loanId}")
    public ResponseEntity<LoanCreatedDTO> getLoanDetails(@PathVariable int loanId) {
        try {
            LoanCreatedDTO loan = loanDAO.getLoanById(loanId);
            if (loan != null) {
                return ResponseEntity.ok(loan);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/loans")
    public ResponseEntity<List<LoanCreatedDTO>> getAllLoans() {
        try {
            List<LoanCreatedDTO> loans = loanDAO.getAllLoans();
            return ResponseEntity.ok(loans);
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/price-updates")
    public ResponseEntity<List<PriceUpdatedDTO>> getPriceUpdates() {
        try {
            List<PriceUpdatedDTO> priceUpdates = priceUpdateDAO.getAllPriceUpdates();
            return ResponseEntity.ok(priceUpdates);
        } catch (SQLException e) {
            return ResponseEntity.status(500).build();
        }
    }
}