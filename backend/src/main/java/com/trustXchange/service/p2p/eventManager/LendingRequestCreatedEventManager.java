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

import com.trustXchange.entities.p2p.P2pLendingRequest;
import com.trustXchange.repository.p2p.P2pLendingRequestRepository;
import com.trustXchange.service.p2p.EventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LendingRequestCreatedEventData;

@Component
public class LendingRequestCreatedEventManager  extends P2PEventManager<LendingRequestCreatedEventData> {
    @Autowired
    private  P2pLendingRequestRepository p2pLendingRequestRepository;

     @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event LENDING_REQUEST_CREATED_EVENT = new Event(
        "LendingRequestCreated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}

        )
    );
    
    @Autowired
    public LendingRequestCreatedEventManager() {
        super(LENDING_REQUEST_CREATED_EVENT);
    }


    public LendingRequestCreatedEventData decode(Log log) {
         List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        Uint256 requestId = (Uint256) nonIndexedValues.get(0);
        Utf8String lender = (Utf8String) nonIndexedValues.get(1);
        Uint256 amountToLendUSD = (Uint256) nonIndexedValues.get(2);
        Uint256 minCollateralRatio = (Uint256) nonIndexedValues.get(3);
        Uint256 liquidationThreshold = (Uint256) nonIndexedValues.get(4);
        Uint256 desiredInterestRate = (Uint256) nonIndexedValues.get(5);
        Uint256 paymentDuration = (Uint256) nonIndexedValues.get(6);
        Uint256 minimalPartialFill = (Uint256) nonIndexedValues.get(7);

        return new LendingRequestCreatedEventData(
            requestId.getValue().intValue(),
            lender.getValue(),
            amountToLendUSD.getValue(),
            minCollateralRatio.getValue(),
            liquidationThreshold.getValue(),
            desiredInterestRate.getValue(),
            paymentDuration.getValue(),
            minimalPartialFill.getValue()
        );
    }

      public void handle(LendingRequestCreatedEventData eventData) {
        P2pLendingRequest p2pLendingRequest = new P2pLendingRequest();
        p2pLendingRequest.setRequestId(eventData.getRequestId());
        p2pLendingRequest.setLender(eventData.getLender());
        p2pLendingRequest.setAmountToLendUsd(eventData.getAmountToLendUSD().longValue());
         p2pLendingRequest.setMinCollateralRatio(eventData.getMinCollateralRatio().longValue());
        p2pLendingRequest.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
        p2pLendingRequest.setDesiredInterestRate(eventData.getDesiredInterestRate().longValue());
        p2pLendingRequest.setPaymentDuration(eventData.getPaymentDuration().longValue());
         p2pLendingRequest.setMinimalPartialFill(eventData.getMinimalPartialFill().longValue());
         p2pLendingRequestRepository.save(p2pLendingRequest);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}