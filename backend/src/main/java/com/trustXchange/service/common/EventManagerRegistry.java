package com.trustXchange.service.common;

import java.util.ArrayList;
import java.util.List;


public class EventManagerRegistry<T extends EventManager> {
    protected final List<T> eventManagers = new ArrayList<>();

    public void register(T eventManager) {
        this.eventManagers.add(eventManager);
    }

    public List<T> getEventManagers() {
        return eventManagers;
    }
}