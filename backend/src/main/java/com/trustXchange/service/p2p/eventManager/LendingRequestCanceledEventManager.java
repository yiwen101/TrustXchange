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

import com.trustXchange.repository.p2p.P2pLendingRequestRepository;
import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LendingRequestCanceledEventData;

@Component
public class LendingRequestCanceledEventManager  extends P2PEventManager<LendingRequestCanceledEventData> {
    @Autowired
    private P2pLendingRequestRepository p2pLendingRequestRepository;

     @Autowired
    private EventManagerRegistry eventManagerRegistry;
    public static final Event LENDING_REQUEST_CANCELED_EVENT = new Event(
        "LendingRequestCanceled",
        Arrays.asList(
             new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {}
        )
    );

    @Autowired
    public LendingRequestCanceledEventManager() {
        super(LENDING_REQUEST_CANCELED_EVENT);
        
    }


    public LendingRequestCanceledEventData decode(Log log) {
         List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        BigInteger requestId = (BigInteger) nonIndexedValues.get(0);
        String canceller = (String) nonIndexedValues.get(1);

        return new LendingRequestCanceledEventData(
             requestId.intValue(),
                canceller
        );
    }
    public void  handle(LendingRequestCanceledEventData eventData) {
        p2pLendingRequestRepository.findById(eventData.getRequestId()).ifPresent(lendingRequest -> {
            lendingRequest.setCanceled(true);
            p2pLendingRequestRepository.save(lendingRequest);
        });
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}