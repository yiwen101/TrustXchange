package com.trustXchange.service.eventHandler;

import com.trustXchange.repository.LendingRequestRepository;
import com.trustXchange.service.eventData.LendingRequestCanceledEventData;
import org.springframework.stereotype.Service;


@Service
public class LendingRequestAutoCanceledEventHandler {
    private LendingRequestRepository lendingRequestRepository;

    public LendingRequestAutoCanceledEventHandler(LendingRequestRepository lendingRequestRepository) {
        this.lendingRequestRepository = lendingRequestRepository;
    }

    public void handle(LendingRequestCanceledEventData eventData) {
        lendingRequestRepository.findById(eventData.getRequestId()).ifPresent(request -> {
            request.setCanceled(true);
            request.setCanceledBySystem(true);
            lendingRequestRepository.save(request);
        });
    }
}