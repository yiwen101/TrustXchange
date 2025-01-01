package com.trustXchange.service.eventHandler;

import java.sql.SQLException;

import com.trustXchange.dao.p2p.P2PLendingRequestDAO;
import com.trustXchange.dto.p2p.P2PLendingRequestDTO;
import com.trustXchange.service.eventData.LendingRequestCanceledEventData;

public class LendingRequestCanceledEventHandler {
        private P2PLendingRequestDAO LendingRequestDAO;

    public LendingRequestCanceledEventHandler(P2PLendingRequestDAO LendingRequestDAO) {
        this.LendingRequestDAO = LendingRequestDAO;
    }

    public void handle(LendingRequestCanceledEventData eventData) {
        try {
            P2PLendingRequestDTO request = LendingRequestDAO.getLendingRequestById(eventData.getRequestId());
            if (request != null) {
                request.setCanceled(true);
                LendingRequestDAO.updateLendingRequest(request);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
