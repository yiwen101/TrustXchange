package com.trustXchange.service.p2p.eventManager;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import com.trustXchange.repository.p2p.P2pBorrowingRequestRepository;
import com.trustXchange.service.p2p.EventManagerRegistry;
import com.trustXchange.service.p2p.eventData.BorrowingRequestAutoCanceledEventData;

@Component
public class BorrowingRequestAutoCanceledEventManager extends P2PEventManager<BorrowingRequestAutoCanceledEventData> {
    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;
    
    @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event BORROWING_REQUEST_AUTO_CANCELED_EVENT = new Event(
        "BorrowingRequestAutoCanceled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {}
        )
    );
    public BorrowingRequestAutoCanceledEventManager() {
        super(BORROWING_REQUEST_AUTO_CANCELED_EVENT);

    }

    public BorrowingRequestAutoCanceledEventData decode(Log log) {
         List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        BigInteger requestId = (BigInteger) nonIndexedValues.get(0);
        return new BorrowingRequestAutoCanceledEventData(
            requestId.intValue()
        );
    }
    public void handle(BorrowingRequestAutoCanceledEventData eventData) {
        p2pBorrowingRequestRepository.findById(eventData.getRequestId()).ifPresent(borrowingRequest -> {
               borrowingRequest.setCanceled(true);
            borrowingRequest.setCanceledBySystem(true);
                p2pBorrowingRequestRepository.save(borrowingRequest);
        });
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }

    
}