package com.trustXchange.service.p2p;

import org.springframework.stereotype.Component;

import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.p2p.eventManager.P2PEventManager;

@Component
public class P2PEventManagerRegistry extends EventManagerRegistry<P2PEventManager> {
    public P2PEventManagerRegistry() {
        super();
    }
}
