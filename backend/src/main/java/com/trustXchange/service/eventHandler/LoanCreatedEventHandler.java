package com.trustXchange.service.eventHandler;

import com.trustXchange.dao.p2p.P2PLoanDAO;
import com.trustXchange.dto.p2p.P2PLoanDTO;
import com.trustXchange.service.eventData.LoanCreatedEventData;
import java.sql.SQLException;

public class LoanCreatedEventHandler {
    private P2PLoanDAO loanDAO;

    public LoanCreatedEventHandler(P2PLoanDAO loanDAO) {
        this.loanDAO = loanDAO;
    }

    public void handle(LoanCreatedEventData eventData) {
        try {
            P2PLoanDTO loan = new P2PLoanDTO(
                eventData.getLoanId(),
                eventData.getLender(),
                eventData.getBorrower(),
                eventData.getAmountBorrowedUSD().doubleValue(),
                eventData.getAmountPayableToLender().doubleValue(),
                eventData.getAmountPayableToPlatform().doubleValue(),
                0.0,
                eventData.getCollateralAmountXRP().doubleValue(),
                eventData.getRepayBy(),
                eventData.getLiquidationThreshold().doubleValue(),
                false 
            );
            loanDAO.createLoan(loan);
        } catch (SQLException e) {
            e.printStackTrace();
            // Handle exception appropriately
        }
    }
}