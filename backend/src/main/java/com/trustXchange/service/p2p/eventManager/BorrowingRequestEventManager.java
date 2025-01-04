package com.trustXchange.service.p2p.eventManager;

import com.trustXchange.entities.p2p.P2pBorrowingRequest;
import com.trustXchange.entities.p2p.P2pBorrowingRequestEvent;
import com.trustXchange.repository.p2p.P2pBorrowingRequestEventRepository;
import com.trustXchange.repository.p2p.P2pBorrowingRequestRepository;
import com.trustXchange.service.p2p.P2PEventManagerRegistry;
import com.trustXchange.service.p2p.eventData.BorrowingRequestEventData;
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
public class BorrowingRequestEventManager  extends P2PEventManager<BorrowingRequestEventData> {

    @Autowired
    private P2PEventManagerRegistry eventManagerRegistry;
    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;
    @Autowired
    private P2pBorrowingRequestEventRepository p2pBorrowingRequestEventRepository;


    public static final Event BORROWING_REQUEST_EVENT = new Event(
        "BorrowingRequestEvent",
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
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Bool>(false) {},
                new TypeReference<Bool>(false) {}
        )
    );

      @Autowired
    public BorrowingRequestEventManager() {
        super(BORROWING_REQUEST_EVENT);
    }

    @Override
    public BorrowingRequestEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        String eventName = (String) nonIndexedValues.get(0);
        BigInteger requestId = (BigInteger) nonIndexedValues.get(1);
        String borrower = (String) nonIndexedValues.get(2);
        BigInteger amountToBorrowUSD = (BigInteger) nonIndexedValues.get(3);
        BigInteger amountBorrowedUSD = (BigInteger) nonIndexedValues.get(4);
        BigInteger initialCollateralAmountXRP = (BigInteger) nonIndexedValues.get(5);
         BigInteger existingCollateralAmountXRP = (BigInteger) nonIndexedValues.get(6);
         BigInteger maxCollateralRatio = (BigInteger) nonIndexedValues.get(7);
        BigInteger liquidationThreshold = (BigInteger) nonIndexedValues.get(8);
        BigInteger desiredInterestRate = (BigInteger) nonIndexedValues.get(9);
        BigInteger paymentDuration = (BigInteger) nonIndexedValues.get(10);
         BigInteger minimalPartialFill = (BigInteger) nonIndexedValues.get(11);
         Boolean canceled = (Boolean) nonIndexedValues.get(12);
        Boolean autoCanceled = (Boolean) nonIndexedValues.get(13);

       return new BorrowingRequestEventData(eventName,requestId, borrower, amountToBorrowUSD, amountBorrowedUSD,
        initialCollateralAmountXRP, existingCollateralAmountXRP, maxCollateralRatio, liquidationThreshold,
        desiredInterestRate, paymentDuration, minimalPartialFill, canceled, autoCanceled);
    }

    @Override
    public void handle(BorrowingRequestEventData eventData) {
        P2pBorrowingRequest p2pBorrowingRequest = new P2pBorrowingRequest();
        p2pBorrowingRequest.setRequestId(eventData.getRequestId().intValue());
        p2pBorrowingRequest.setBorrower(eventData.getBorrower());
        p2pBorrowingRequest.setAmountToBorrowUsd(eventData.getAmountToBorrowUSD().longValue());
        p2pBorrowingRequest.setAmountBorrowedUsd(eventData.getAmountBorrowedUSD().longValue());
        p2pBorrowingRequest.setInitialCollateralAmountXrp(eventData.getInitialCollateralAmountXRP().longValue());
        p2pBorrowingRequest.setExistingCollateralAmountXrp(eventData.getExistingCollateralAmountXRP().longValue());
        p2pBorrowingRequest.setMaxCollateralRatio(eventData.getMaxCollateralRatio().longValue());
        p2pBorrowingRequest.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
        p2pBorrowingRequest.setDesiredInterestRate(eventData.getDesiredInterestRate().longValue());
        p2pBorrowingRequest.setPaymentDuration(eventData.getPaymentDuration().longValue());
        p2pBorrowingRequest.setMinimalPartialFill(eventData.getMinimalPartialFill().longValue());
        p2pBorrowingRequest.setCanceled(eventData.isCanceled());
        p2pBorrowingRequest.setCanceledBySystem(eventData.isAutoCanceled());
        p2pBorrowingRequestRepository.save(p2pBorrowingRequest);
    
        P2pBorrowingRequestEvent p2pBorrowingRequestEvent = new P2pBorrowingRequestEvent();
        p2pBorrowingRequestEvent.setTransactionHash(eventData.getTransactionHash());
        p2pBorrowingRequestEvent.setTransactionUrl(eventData.getTransactionUrl());
        p2pBorrowingRequestEvent.setRequestId(eventData.getRequestId().intValue());
        p2pBorrowingRequestEvent.setEventName(eventData.getEventName());
        p2pBorrowingRequestEventRepository.save(p2pBorrowingRequestEvent);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}