package com.trustXchange.service.eventHandler.BorrowRequest;

import com.trustXchange.dao.p2p.P2PBorrowingRequestDAO;
import com.trustXchange.dto.p2p.P2PBorrowingRequestDTO;
import com.trustXchange.service.eventData.BorrowingRequestCanceledEventData;

import java.sql.SQLException;

public class BorrowingRequestAutoCanceledEventHandler {
    private P2PBorrowingRequestDAO borrowingRequestDAO;

    public BorrowingRequestAutoCanceledEventHandler(P2PBorrowingRequestDAO borrowingRequestDAO) {
        this.borrowingRequestDAO = borrowingRequestDAO;
    }

    public void handle(BorrowingRequestCanceledEventData eventData) {
        try {
            P2PBorrowingRequestDTO request = borrowingRequestDAO.getBorrowingRequestById(eventData.getRequestId());
            if (request != null) {
                request.setCanceled(true);
                request.setCanceledBySystem(true);
                borrowingRequestDAO.updateBorrowingRequest(request);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}