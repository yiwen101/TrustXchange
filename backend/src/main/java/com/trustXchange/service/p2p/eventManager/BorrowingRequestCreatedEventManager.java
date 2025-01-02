package com.trustXchange.service.p2p.eventManager;

import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import com.trustXchange.entities.p2p.P2pBorrowingRequest;
import com.trustXchange.repository.p2p.P2pBorrowingRequestRepository;
import com.trustXchange.service.p2p.EventManagerRegistry;
import com.trustXchange.service.p2p.eventData.BorrowingRequestCreatedEventData;

@Component
public class BorrowingRequestCreatedEventManager  extends P2PEventManager<BorrowingRequestCreatedEventData> {
    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;

     @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event BORROWING_REQUEST_CREATED_EVENT = new Event(
        "BorrowingRequestCreated",
        Arrays.asList(
             new TypeReference<Uint256>(false) {},
             new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );
    @Autowired
    public BorrowingRequestCreatedEventManager() {
        super(BORROWING_REQUEST_CREATED_EVENT);
        
    }

    public BorrowingRequestCreatedEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        Uint256 requestId = (Uint256) nonIndexedValues.get(0);
        Utf8String borrower = (Utf8String) nonIndexedValues.get(1);
        Uint256 amountToBorrowUSD = (Uint256) nonIndexedValues.get(2);
          Uint256 collateralAmountXRP = (Uint256) nonIndexedValues.get(3);
          Uint256 maxCollateralRatio = (Uint256) nonIndexedValues.get(4);
        Uint256 liquidationThreshold = (Uint256) nonIndexedValues.get(5);
        Uint256 desiredInterestRate = (Uint256) nonIndexedValues.get(6);
        Uint256 paymentDuration = (Uint256) nonIndexedValues.get(7);
        Uint256 minimalPartialFill = (Uint256) nonIndexedValues.get(8);

        return new BorrowingRequestCreatedEventData(
            requestId.getValue().intValue(),
            borrower.getValue(),
            amountToBorrowUSD.getValue(),
                collateralAmountXRP.getValue(),
            maxCollateralRatio.getValue(),
            liquidationThreshold.getValue(),
            desiredInterestRate.getValue(),
            paymentDuration.getValue(),
            minimalPartialFill.getValue()
        );
    }
    public void  handle(BorrowingRequestCreatedEventData eventData) {
           P2pBorrowingRequest p2pBorrowingRequest = new P2pBorrowingRequest();
           p2pBorrowingRequest.setRequestId(eventData.getRequestId());
           p2pBorrowingRequest.setBorrower(eventData.getBorrower());
           p2pBorrowingRequest.setAmountToBorrowUsd(eventData.getAmountToBorrowUSD().longValue());
           p2pBorrowingRequest.setInitialCollateralAmountXrp(eventData.getCollateralAmountXRP().longValue());
           p2pBorrowingRequest.setMaxCollateralRatio(eventData.getMaxCollateralRatio().longValue());
           p2pBorrowingRequest.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
           p2pBorrowingRequest.setDesiredInterestRate(eventData.getDesiredInterestRate().longValue());
           p2pBorrowingRequest.setPaymentDuration(eventData.getPaymentDuration().longValue());
           p2pBorrowingRequest.setMinimalPartialFill(eventData.getMinimalPartialFill().longValue());
        p2pBorrowingRequestRepository.save(p2pBorrowingRequest);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}