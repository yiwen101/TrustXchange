package com.trustXchange.Service.P2P.EventHandler.BorrowRequest;

import com.trustXchange.DAO.P2P.P2PBorrowingRequestDAO;
import com.trustXchange.DTO.P2P.P2PBorrowingRequestDTO;
import com.trustXchange.Service.P2P.EventData.BorrowingRequestCanceledEventData;
import java.sql.SQLException;

public class BorrowingRequestCanceledEventHandler {
    private P2PBorrowingRequestDAO borrowingRequestDAO;

    public BorrowingRequestCanceledEventHandler(P2PBorrowingRequestDAO borrowingRequestDAO) {
        this.borrowingRequestDAO = borrowingRequestDAO;
    }

    public void handle(BorrowingRequestCanceledEventData eventData) {
        try {
            P2PBorrowingRequestDTO request = borrowingRequestDAO.getBorrowingRequestById(eventData.getRequestId());
            if (request != null) {
                request.setCanceled(true);
                borrowingRequestDAO.updateBorrowingRequest(request);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}