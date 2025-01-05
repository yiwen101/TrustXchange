package com.trustXchange.service.option;

import org.springframework.stereotype.Component;

import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.option.eventManager.OptionEventManager;

@Component
public class OptionEventManagerRegistry extends EventManagerRegistry<OptionEventManager> {
    public OptionEventManagerRegistry() {
        super();
    }
}
