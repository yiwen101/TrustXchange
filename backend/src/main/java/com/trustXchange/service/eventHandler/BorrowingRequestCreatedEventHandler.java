package com.trustXchange.service.eventHandler;


import com.trustXchange.entity.BorrowingRequestEntity;
import com.trustXchange.repository.BorrowingRequestRepository;
import com.trustXchange.service.eventData.BorrowingRequestCreatedEventData;
import org.springframework.stereotype.Service;

@Service
public class BorrowingRequestCreatedEventHandler {
    private BorrowingRequestRepository borrowingRequestRepository;

    public BorrowingRequestCreatedEventHandler(BorrowingRequestRepository borrowingRequestRepository) {
        this.borrowingRequestRepository = borrowingRequestRepository;
    }

    public void handle(BorrowingRequestCreatedEventData eventData) {
        BorrowingRequestEntity request = new BorrowingRequestEntity();
        request.setRequestId(eventData.getRequestId());
        request.setBorrower(eventData.getBorrower());
        request.setAmountToBorrowUSD(eventData.getAmountToBorrowUSD().doubleValue());
        request.setAmountBorrowedUSD(0.0);
        request.setInitialCollateralAmountXRP(eventData.getCollateralAmountXRP().doubleValue());
        request.setExistingCollateralAmountXRP(eventData.getCollateralAmountXRP().doubleValue());
        request.setMaxCollateralRatio(eventData.getMaxCollateralRatio().doubleValue());
        request.setLiquidationThreshold(eventData.getLiquidationThreshold().doubleValue());
        request.setDesiredInterestRate(eventData.getDesiredInterestRate().doubleValue());
        request.setPaymentDuration(eventData.getPaymentDuration().getSeconds());
        request.setMinimalPartialFill(eventData.getMinimalPartialFill().doubleValue());
        request.setCanceled(false);
        request.setCanceledBySystem(false);

        borrowingRequestRepository.save(request);

    }
}