package com.trustXchange.Service.P2P.EventHandler.BorrowRequest;

import com.trustXchange.DAO.P2P.P2PBorrowingRequestDAO;
import com.trustXchange.DTO.P2P.P2PBorrowingRequestDTO;
import com.trustXchange.Service.P2P.EventData.BorrowingRequestCreatedEventData;
import java.sql.SQLException;

public class BorrowingRequestCreatedEventHandler {
    private P2PBorrowingRequestDAO borrowingRequestDAO;

    public BorrowingRequestCreatedEventHandler(P2PBorrowingRequestDAO borrowingRequestDAO) {
        this.borrowingRequestDAO = borrowingRequestDAO;
    }

    public void handle(BorrowingRequestCreatedEventData eventData) {
        try {
            P2PBorrowingRequestDTO request = new P2PBorrowingRequestDTO(
                eventData.getRequestId(),
                eventData.getBorrower(),
                eventData.getAmountToBorrowUSD().doubleValue(),
                0.0, 
                eventData.getCollateralAmountXRP().doubleValue(),
                eventData.getCollateralAmountXRP().doubleValue(),
                eventData.getMaxCollateralRatio().doubleValue(),
                eventData.getLiquidationThreshold().doubleValue(),
                eventData.getDesiredInterestRate().doubleValue(),
                eventData.getPaymentDuration(),
                eventData.getMinimalPartialFill().doubleValue(),
                false,
                false
            );
            borrowingRequestDAO.createBorrowingRequest(request);
        } catch (SQLException e) {
            e.printStackTrace();
            // Handle exception appropriately
        }
    }
}