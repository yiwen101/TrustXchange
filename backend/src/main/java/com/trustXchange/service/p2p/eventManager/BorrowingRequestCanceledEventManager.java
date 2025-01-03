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

import com.trustXchange.repository.p2p.P2pBorrowingRequestRepository;
import com.trustXchange.service.p2p.P2PEventManagerRegistry;
import com.trustXchange.service.p2p.eventData.BorrowingRequestCanceledEventData;

@Component
public class BorrowingRequestCanceledEventManager  extends P2PEventManager<BorrowingRequestCanceledEventData> {
    @Autowired
    private P2pBorrowingRequestRepository p2pBorrowingRequestRepository;

    @Autowired
    private P2PEventManagerRegistry eventManagerRegistry;

    public static final Event BORROWING_REQUEST_CANCELED_EVENT = new Event(
        "BorrowingRequestCanceled",
        Arrays.asList(
             new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {}
        )
    );
    @Autowired
    public BorrowingRequestCanceledEventManager() {
        super(BORROWING_REQUEST_CANCELED_EVENT);
       
    }


    public BorrowingRequestCanceledEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        BigInteger requestId = (BigInteger) nonIndexedValues.get(0);
         String canceller = (String) nonIndexedValues.get(1);

        return new BorrowingRequestCanceledEventData(
            requestId.intValue(),
            canceller
        );
    }
     public void handle(BorrowingRequestCanceledEventData eventData) {
           p2pBorrowingRequestRepository.findById(eventData.getRequestId()).ifPresent(borrowingRequest -> {
                borrowingRequest.setCanceled(true);
               p2pBorrowingRequestRepository.save(borrowingRequest);
        });
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}