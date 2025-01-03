package com.trustXchange.service.p2p.eventManager;

import org.web3j.abi.datatypes.Event;

import com.trustXchange.service.common.EventManager;
import com.trustXchange.service.p2p.eventData.P2PEventData;

public abstract class P2PEventManager<T extends P2PEventData> extends EventManager<T>{
    P2PEventManager(Event _event) {
        super(_event);
    }
}
