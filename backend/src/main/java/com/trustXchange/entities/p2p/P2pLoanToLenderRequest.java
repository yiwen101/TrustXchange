package com.trustXchange.entities.p2p;

import javax.persistence.*;

@Entity
@Table(name = "p2p_loan_to_lender_request")
public class P2pLoanToLenderRequest {

    @Id
    @Column(name = "loan_id")
     private Integer loanId;


    @Column(name="lend_request_id")
    private Integer lendRequestId;


    @ManyToOne
    @JoinColumn(name = "lend_request_id", referencedColumnName = "request_id", insertable = false, updatable = false)
    private P2pLendingRequest p2pLendingRequest;

    @OneToOne
    @JoinColumn(name = "loan_id", referencedColumnName = "loan_id",insertable = false, updatable = false)
    private P2pLoan p2pLoan;


    // Default constructor
    public P2pLoanToLenderRequest() {
    }

    public Integer getLoanId() {
        return loanId;
    }

    public void setLoanId(Integer loanId) {
        this.loanId = loanId;
    }

    public Integer getLendRequestId() {
        return lendRequestId;
    }

    public void setLendRequestId(Integer lendRequestId) {
        this.lendRequestId = lendRequestId;
    }

    public P2pLendingRequest getP2pLendingRequest() {
        return p2pLendingRequest;
    }

    public void setP2pLendingRequest(P2pLendingRequest p2pLendingRequest) {
        this.p2pLendingRequest = p2pLendingRequest;
    }

    public P2pLoan getP2pLoan() {
        return p2pLoan;
    }

    public void setP2pLoan(P2pLoan p2pLoan) {
        this.p2pLoan = p2pLoan;
    }
}