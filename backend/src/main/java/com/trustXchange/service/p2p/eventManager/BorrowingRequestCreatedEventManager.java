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

import com.trustXchange.entities.p2p.P2pBorrowingRequest;
import com.trustXchange.repository.p2p.P2pBorrowingRequestRepository;
import com.trustXchange.service.common.EventManagerRegistry;
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
        BigInteger requestId = (BigInteger) nonIndexedValues.get(0);
        String borrower = (String) nonIndexedValues.get(1);
        BigInteger amountToBorrowUSD = (BigInteger) nonIndexedValues.get(2);
        BigInteger collateralAmountXRP = (BigInteger) nonIndexedValues.get(3);
        BigInteger maxCollateralRatio = (BigInteger) nonIndexedValues.get(4);
        BigInteger liquidationThreshold = (BigInteger) nonIndexedValues.get(5);
        BigInteger desiredInterestRate = (BigInteger) nonIndexedValues.get(6);
        BigInteger paymentDuration = (BigInteger) nonIndexedValues.get(7);
        BigInteger minimalPartialFill = (BigInteger) nonIndexedValues.get(8);

        return new BorrowingRequestCreatedEventData(
            requestId.intValue(),
            borrower,
            amountToBorrowUSD,
                collateralAmountXRP,
            maxCollateralRatio,
            liquidationThreshold,
            desiredInterestRate,
            paymentDuration,
            minimalPartialFill
        );
    }
    public void  handle(BorrowingRequestCreatedEventData eventData) {
           P2pBorrowingRequest p2pBorrowingRequest = new P2pBorrowingRequest();
           p2pBorrowingRequest.setRequestId(eventData.getRequestId());
           p2pBorrowingRequest.setBorrower(eventData.getBorrower());
           p2pBorrowingRequest.setAmountToBorrowUsd(eventData.getAmountToBorrowUSD().longValue());
           p2pBorrowingRequest.setAmountBorrowedUsd(Long.valueOf(0));
           p2pBorrowingRequest.setInitialCollateralAmountXrp(eventData.getCollateralAmountXRP().longValue());
           p2pBorrowingRequest.setExistingCollateralAmountXrp(eventData.getCollateralAmountXRP().longValue());
           p2pBorrowingRequest.setMaxCollateralRatio(eventData.getMaxCollateralRatio().longValue());
           p2pBorrowingRequest.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
           p2pBorrowingRequest.setDesiredInterestRate(eventData.getDesiredInterestRate().longValue());
           p2pBorrowingRequest.setPaymentDuration(eventData.getPaymentDuration().longValue());
           p2pBorrowingRequest.setMinimalPartialFill(eventData.getMinimalPartialFill().longValue());
            p2pBorrowingRequest.setCanceled(false);
            p2pBorrowingRequest.setCanceledBySystem(false);
        p2pBorrowingRequestRepository.save(p2pBorrowingRequest);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}