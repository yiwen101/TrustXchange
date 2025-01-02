package com.trustXchange.service.p2p.eventManager;

import java.util.ArrayList;
import java.util.List;

import org.web3j.abi.EventEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.datatypes.Event;
import org.web3j.protocol.core.methods.response.Log;

import com.trustXchange.service.p2p.eventData.P2PEventData;

import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Type;

public abstract class P2PEventManager<T extends P2PEventData>{
    private Event event;
    private String eventHash;

    P2PEventManager(Event _event) {
        event = _event;
        eventHash = EventEncoder.encode(event);
    }

    abstract  public void handle(T  eventData);

    abstract public T  decode(Log log);

    protected List<Object> getNonIndexedValuesOf(Log log) {
        return List.of(FunctionReturnDecoder.decode(log.getData(), event.getNonIndexedParameters()).stream().map(Type::getValue).toArray());
    }

    protected List<Object> getIndexedValuesOf(Log log) {
        @SuppressWarnings("rawtypes")
        List<TypeReference<Type>> indexedParametersTypes = event.getIndexedParameters();
        List<String> topics = log.getTopics();
        List<Object> indexedParameters = new ArrayList<>();
        for (int i = 1; i < topics.size(); i++) {
            indexedParameters.add(FunctionReturnDecoder.decodeIndexedValue(topics.get(i), indexedParametersTypes.get(i - 1)));
        }
        return indexedParameters;
    }

    public void manage(Log log) {
        String logEventHash = log.getTopics().get(0);
        if (logEventHash.equals(eventHash)) {
            T eventData = decode(log);
            System.out.println("Event data: " + eventData);
            handle(eventData);
        }
    }
}
