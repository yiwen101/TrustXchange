package com.trustXchange.service.p2p.eventManager;

import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import com.trustXchange.repository.p2p.P2pLendingRequestRepository;
import com.trustXchange.service.p2p.EventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LendingRequestAutoCanceledEventData;

@Component
public class LendingRequestAutoCanceledEventManager  extends P2PEventManager<LendingRequestAutoCanceledEventData> {
    @Autowired
    private P2pLendingRequestRepository p2pLendingRequestRepository;

     @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event LENDING_REQUEST_AUTO_CANCELED_EVENT = new Event(
        "LendingRequestAutoCanceled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {}
        )
    );
    @Autowired
    public LendingRequestAutoCanceledEventManager() {
        super(LENDING_REQUEST_AUTO_CANCELED_EVENT);
       
    }
    public LendingRequestAutoCanceledEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        Uint256 requestId = (Uint256) nonIndexedValues.get(0);

        return new LendingRequestAutoCanceledEventData(
            requestId.getValue().intValue()
        );
    }
    public void handle(LendingRequestAutoCanceledEventData eventData) {
           p2pLendingRequestRepository.findById(eventData.getRequestId()).ifPresent(lendingRequest -> {
                lendingRequest.setCanceled(true);
                lendingRequest.setCanceledBySystem(true);
                p2pLendingRequestRepository.save(lendingRequest);
        });
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}