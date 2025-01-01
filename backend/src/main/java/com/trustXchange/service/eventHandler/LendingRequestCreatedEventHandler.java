package com.trustXchange.service.eventHandler;

import com.trustXchange.entity.LendingRequestEntity;
import com.trustXchange.repository.LendingRequestRepository;
import com.trustXchange.service.eventData.LendingRequestCreatedEventData;
import org.springframework.stereotype.Service;


@Service
public class LendingRequestCreatedEventHandler {
    private LendingRequestRepository lendingRequestRepository;

    public LendingRequestCreatedEventHandler(LendingRequestRepository lendingRequestRepository) {
        this.lendingRequestRepository = lendingRequestRepository;
    }

    public void handle(LendingRequestCreatedEventData eventData) {
        LendingRequestEntity request = new LendingRequestEntity();
        request.setRequestId(eventData.getRequestId());
        request.setLender(eventData.getLender());
        request.setAmountToLendUSD(eventData.getAmountToLendUSD().doubleValue());
        request.setAmountLendedUSD(0.0);
        request.setMinCollateralRatio(eventData.getMinCollateralRatio().doubleValue());
        request.setLiquidationThreshold(eventData.getLiquidationThreshold().doubleValue());
        request.setDesiredInterestRate(eventData.getDesiredInterestRate().doubleValue());
        request.setPaymentDuration(eventData.getPaymentDuration().getSeconds());
        request.setMinimalPartialFill(eventData.getMinimalPartialFill().doubleValue());
        request.setCanceled(false);
        request.setCanceledBySystem(false);

        lendingRequestRepository.save(request);
    }
}