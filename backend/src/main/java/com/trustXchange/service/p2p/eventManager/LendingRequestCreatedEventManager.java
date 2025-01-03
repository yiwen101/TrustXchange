package com.trustXchange.service.p2p.eventManager;

import java.math.BigInteger;
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
import com.trustXchange.service.p2p.P2PEventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LendingRequestCreatedEventData;

@Component
public class LendingRequestCreatedEventManager  extends P2PEventManager<LendingRequestCreatedEventData> {
    @Autowired
    private  P2pLendingRequestRepository p2pLendingRequestRepository;

     @Autowired
    private P2PEventManagerRegistry eventManagerRegistry;

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
         BigInteger requestId = (BigInteger) nonIndexedValues.get(0);
        String lender = ((String) nonIndexedValues.get(1));
        BigInteger amountToLendUSD = ((BigInteger) nonIndexedValues.get(2));
        BigInteger minCollateralRatio = ((BigInteger) nonIndexedValues.get(3));
        BigInteger liquidationThreshold = ((BigInteger) nonIndexedValues.get(4));
        BigInteger desiredInterestRate = ((BigInteger) nonIndexedValues.get(5));
        BigInteger paymentDuration = ((BigInteger) nonIndexedValues.get(6));
        BigInteger minimalPartialFill = ((BigInteger) nonIndexedValues.get(7));

        return new LendingRequestCreatedEventData(
            requestId.intValue(),
            lender,
            amountToLendUSD,
            minCollateralRatio,
            liquidationThreshold,
            desiredInterestRate,
            paymentDuration,
            minimalPartialFill
        );
    }

      public void handle(LendingRequestCreatedEventData eventData) {
        P2pLendingRequest p2pLendingRequest = new P2pLendingRequest();
        p2pLendingRequest.setRequestId(eventData.getRequestId());
        p2pLendingRequest.setLender(eventData.getLender());
        p2pLendingRequest.setAmountToLendUsd(eventData.getAmountToLendUSD().longValue());
        p2pLendingRequest.setAmountLendedUsd(Long.valueOf(0));
         p2pLendingRequest.setMinCollateralRatio(eventData.getMinCollateralRatio().longValue());
        p2pLendingRequest.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
        p2pLendingRequest.setDesiredInterestRate(eventData.getDesiredInterestRate().longValue());
        p2pLendingRequest.setPaymentDuration(eventData.getPaymentDuration().longValue());
         p2pLendingRequest.setMinimalPartialFill(eventData.getMinimalPartialFill().longValue());
         p2pLendingRequest.setCanceled(false);
         p2pLendingRequest.setCanceledBySystem(false);
         p2pLendingRequestRepository.save(p2pLendingRequest);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}