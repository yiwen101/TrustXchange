package com.trustXchange.service.eventHandler;

import java.sql.SQLException;

import com.trustXchange.dao.p2p.P2PLoanDAO;
import com.trustXchange.dto.p2p.P2PLoanDTO;
import com.trustXchange.service.eventData.LoanRepaidEventData;

public class LoanRepaidEventHandler {
    private P2PLoanDAO loanDAO;

    public LoanRepaidEventHandler(P2PLoanDAO loanDAO) {
        this.loanDAO = loanDAO;
    }

    public void handle(LoanRepaidEventData eventData) {
        try {
            P2PLoanDTO loan = loanDAO.getLoanById(eventData.getLoanId());
            loan.setAmountPaidUSD(eventData.getTotalPaid().doubleValue());
            loanDAO.updateLoan(loan);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    
}
