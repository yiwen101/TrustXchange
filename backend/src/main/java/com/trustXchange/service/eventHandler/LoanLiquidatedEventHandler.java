package com.trustXchange.service.eventHandler;

import java.sql.SQLException;

import com.trustXchange.dao.p2p.P2PLoanDAO;
import com.trustXchange.dto.p2p.P2PLoanDTO;
import com.trustXchange.service.eventData.LoanLiquidatedEventData;

public class LoanLiquidatedEventHandler {
    private P2PLoanDAO loanDAO;

    public LoanLiquidatedEventHandler(P2PLoanDAO loanDAO) {
        this.loanDAO = loanDAO;
    }

    public void handle(LoanLiquidatedEventData eventData) {
        try {
            P2PLoanDTO loan = loanDAO.getLoanById(eventData.getLoanId());
            loan.setLiquidated(true);
            loanDAO.updateLoan(loan);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
