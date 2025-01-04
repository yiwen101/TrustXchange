package com.trustXchange.service.option.eventManager;

import org.web3j.abi.datatypes.Event;

import com.trustXchange.service.common.EventManager;
import com.trustXchange.service.option.eventData.OptionEventData;

public abstract class OptionEventManager <T extends OptionEventData> extends EventManager<T>{
    OptionEventManager(Event _event) {
        super(_event);
    }
}
