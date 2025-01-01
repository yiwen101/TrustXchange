package com.trustXchange.service.eventHandler;


import com.trustXchange.repository.LendingRequestRepository;
import com.trustXchange.service.eventData.LendingRequestCanceledEventData;
import org.springframework.stereotype.Service;

@Service
public class LendingRequestCanceledEventHandler {
    private LendingRequestRepository lendingRequestRepository;

    public LendingRequestCanceledEventHandler(LendingRequestRepository lendingRequestRepository) {
        this.lendingRequestRepository = lendingRequestRepository;
    }

    public void handle(LendingRequestCanceledEventData eventData) {
        lendingRequestRepository.findById(eventData.getRequestId()).ifPresent(request ->{
            request.setCanceled(true);
            lendingRequestRepository.save(request);
        });

    }
}