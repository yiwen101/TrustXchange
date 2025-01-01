package com.trustXchange.service.eventHandler;

import java.sql.SQLException;

import com.trustXchange.dao.p2p.P2PLendingRequestDAO;
import com.trustXchange.dto.p2p.P2PLendingRequestDTO;
import com.trustXchange.service.eventData.LendingRequestCreatedEventData;

public class LendingRequestCreatedEventHandler {
     private P2PLendingRequestDAO LendingRequestDAO;

    public LendingRequestCreatedEventHandler(P2PLendingRequestDAO LendingRequestDAO) {
        this.LendingRequestDAO = LendingRequestDAO;
    }

    public void handle(LendingRequestCreatedEventData eventData) {
        try {
            P2PLendingRequestDTO request = new P2PLendingRequestDTO(
                eventData.getRequestId(),
                eventData.getLender(),
                eventData.getAmountToLendUSD().doubleValue(),
                0.0,
                eventData.getMinCollateralRatio().doubleValue(),
                eventData.getLiquidationThreshold().doubleValue(),
                eventData.getDesiredInterestRate().doubleValue(),
                eventData.getPaymentDuration(),
                eventData.getMinimalPartialFill().doubleValue(),
                false,
                false
            );
            LendingRequestDAO.createLendingRequest(request);
        } catch (SQLException e) {
            e.printStackTrace();
            // Handle exception appropriately
        }
    }
    
}
