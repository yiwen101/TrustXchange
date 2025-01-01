package com.trustXchange.service.eventHandler;

import com.trustXchange.repository.BorrowingRequestRepository;
import com.trustXchange.service.eventData.BorrowingRequestCanceledEventData;
import org.springframework.stereotype.Service;

@Service
public class BorrowingRequestAutoCanceledEventHandler {
    private BorrowingRequestRepository borrowingRequestRepository;

    public BorrowingRequestAutoCanceledEventHandler(BorrowingRequestRepository borrowingRequestRepository) {
        this.borrowingRequestRepository = borrowingRequestRepository;
    }

    public void handle(BorrowingRequestCanceledEventData eventData) {
            borrowingRequestRepository.findById(eventData.getRequestId()).ifPresent(request ->{
                request.setCanceled(true);
                request.setCanceledBySystem(true);
                borrowingRequestRepository.save(request);
            });

    }
}