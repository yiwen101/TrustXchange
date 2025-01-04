package com.trustXchange.service.p2p.eventManager;

import com.trustXchange.entities.p2p.P2pLendingRequest;
import com.trustXchange.entities.p2p.P2pLendingRequestEvent;
import com.trustXchange.repository.p2p.P2pLendingRequestEventRepository;
import com.trustXchange.repository.p2p.P2pLendingRequestRepository;
import com.trustXchange.service.p2p.P2PEventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LendingRequestEventData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.abi.datatypes.Bool;

import javax.annotation.PostConstruct;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;

@Component
public class LendingRequestEventManager  extends P2PEventManager<LendingRequestEventData> {

     @Autowired
    private P2PEventManagerRegistry eventManagerRegistry;

    @Autowired
    private P2pLendingRequestRepository p2pLendingRequestRepository;

    @Autowired
    private P2pLendingRequestEventRepository p2pLendingRequestEventRepository;

    public static final Event LENDING_REQUEST_EVENT = new Event(
        "LendingRequestEvent",
        Arrays.asList(
                new TypeReference<Utf8String>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Utf8String>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Bool>(false) {},
                new TypeReference<Bool>(false) {}
        )
    );

    @Autowired
    public LendingRequestEventManager() {
        super(LENDING_REQUEST_EVENT);
    }


     @Override
    public LendingRequestEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        String eventName = (String) nonIndexedValues.get(0);
        BigInteger requestId = (BigInteger) nonIndexedValues.get(1);
        String lender = (String) nonIndexedValues.get(2);
        BigInteger amountToLendUSD = (BigInteger) nonIndexedValues.get(3);
        BigInteger amountLendedUSD = (BigInteger) nonIndexedValues.get(4);
        BigInteger minCollateralRatio = (BigInteger) nonIndexedValues.get(5);
        BigInteger liquidationThreshold = (BigInteger) nonIndexedValues.get(6);
        BigInteger desiredInterestRate = (BigInteger) nonIndexedValues.get(7);
        BigInteger paymentDuration = (BigInteger) nonIndexedValues.get(8);
        BigInteger minimalPartialFill = (BigInteger) nonIndexedValues.get(9);
        Boolean canceled = (Boolean) nonIndexedValues.get(10);
        Boolean autoCanceled = (Boolean) nonIndexedValues.get(11);


        return new LendingRequestEventData(eventName,requestId, lender, amountToLendUSD, amountLendedUSD, minCollateralRatio,
        liquidationThreshold, desiredInterestRate, paymentDuration, minimalPartialFill, canceled, autoCanceled);
    }

    @Override
    public void handle(LendingRequestEventData eventData) {
           P2pLendingRequest p2pLendingRequest = new P2pLendingRequest();
           p2pLendingRequest.setRequestId(eventData.getRequestId().intValue());
           p2pLendingRequest.setLender(eventData.getLender());
           p2pLendingRequest.setAmountToLendUsd(eventData.getAmountToLendUSD().longValue());
           p2pLendingRequest.setAmountLendedUsd(eventData.getAmountLendedUSD().longValue());
           p2pLendingRequest.setMinCollateralRatio(eventData.getMinCollateralRatio().longValue());
           p2pLendingRequest.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
           p2pLendingRequest.setDesiredInterestRate(eventData.getDesiredInterestRate().longValue());
           p2pLendingRequest.setPaymentDuration(eventData.getPaymentDuration().longValue());
           p2pLendingRequest.setMinimalPartialFill(eventData.getMinimalPartialFill().longValue());
            p2pLendingRequest.setCanceled(eventData.isCanceled());
            p2pLendingRequest.setCanceledBySystem(eventData.isAutoCanceled());
        p2pLendingRequestRepository.save(p2pLendingRequest);

        P2pLendingRequestEvent p2pLendingRequestEvent = new P2pLendingRequestEvent();
        p2pLendingRequestEvent.setTransactionHash(eventData.getTransactionHash());
        p2pLendingRequestEvent.setTransactionUrl(eventData.getTransactionUrl());
        p2pLendingRequestEvent.setRequestId(eventData.getRequestId().intValue());
        p2pLendingRequestEvent.setEventName(eventData.getEventName());
        p2pLendingRequestEventRepository.save(p2pLendingRequestEvent);
    }
      @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}