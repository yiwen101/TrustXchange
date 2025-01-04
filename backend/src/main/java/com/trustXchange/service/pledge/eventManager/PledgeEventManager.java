package com.trustXchange.service.pledge.eventManager;

import org.web3j.abi.datatypes.Event;

import com.trustXchange.service.common.EventManager;
import com.trustXchange.service.pledge.eventData.PledgeEventData;

public abstract class PledgeEventManager<T extends PledgeEventData> extends EventManager<T>{
    PledgeEventManager(Event _event) {
        super(_event);
    }
}