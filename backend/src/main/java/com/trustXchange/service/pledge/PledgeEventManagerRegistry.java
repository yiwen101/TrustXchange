package com.trustXchange.service.pledge;

import org.springframework.stereotype.Component;

import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.pledge.eventManager.PledgeEventManager;

@Component
public class PledgeEventManagerRegistry extends EventManagerRegistry<PledgeEventManager> {
    public PledgeEventManagerRegistry() {
        super();
    }
}
