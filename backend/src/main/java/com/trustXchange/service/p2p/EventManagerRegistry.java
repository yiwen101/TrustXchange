package com.trustXchange.service.p2p;

import java.util.stream.Stream;
import org.springframework.stereotype.Component;

import com.trustXchange.service.p2p.eventManager.P2PEventManager;

import java.util.ArrayList;
import java.util.List;

@Component
public class EventManagerRegistry {
    private final List<P2PEventManager<?>> eventManagers = new ArrayList<>();

    public void register(P2PEventManager<?> eventManager) {
        this.eventManagers.add(eventManager);
    }

    public Stream<P2PEventManager<?>> getEventManagerStream() {
        return eventManagers.stream();
    }
}