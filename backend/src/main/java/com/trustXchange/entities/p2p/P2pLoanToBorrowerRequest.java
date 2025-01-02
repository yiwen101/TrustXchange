package com.trustXchange.entities.p2p;

import javax.persistence.*;


@Entity
@Table(name = "p2p_loan_to_borrower_request")
public class P2pLoanToBorrowerRequest {
    @Id
    @Column(name = "loan_id")
    private Integer loanId;
    @Column(name="borrow_request_id")
    private Integer borrowRequestId;

    @ManyToOne
    @JoinColumn(name="borrow_request_id", referencedColumnName="request_id", insertable = false, updatable = false)
    private P2pBorrowingRequest p2pBorrowingRequest;
    @OneToOne
    @JoinColumn(name = "loan_id", referencedColumnName = "loan_id", insertable = false, updatable = false)
    private P2pLoan p2pLoan;

    // Default constructor
    public P2pLoanToBorrowerRequest() {
    }

    public Integer getLoanId() {
        return loanId;
    }

    public void setLoanId(Integer loanId) {
        this.loanId = loanId;
    }

    public Integer getBorrowRequestId() {
        return borrowRequestId;
    }

    public void setBorrowRequestId(Integer borrowRequestId) {
        this.borrowRequestId = borrowRequestId;
    }

    public P2pBorrowingRequest getP2pBorrowingRequest() {
        return p2pBorrowingRequest;
    }

    public void setP2pBorrowingRequest(P2pBorrowingRequest p2pBorrowingRequest) {
        this.p2pBorrowingRequest = p2pBorrowingRequest;
    }

    public P2pLoan getP2pLoan() {
        return p2pLoan;
    }

    public void setP2pLoan(P2pLoan p2pLoan) {
        this.p2pLoan = p2pLoan;
    }
}