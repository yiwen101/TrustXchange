package com.trustXchange.service.common;

import java.util.stream.Stream;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EventManagerRegistry {
    private final List<EventManager<?>> eventManagers = new ArrayList<>();

    public void register(EventManager<?> eventManager) {
        this.eventManagers.add(eventManager);
    }

    public Stream<EventManager<?>> getEventManagerStream() {
        return eventManagers.stream();
    }
}