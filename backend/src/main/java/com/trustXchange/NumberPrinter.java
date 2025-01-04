package com.trustXchange;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class NumberPrinter {

    private static final Logger logger = LoggerFactory.getLogger(NumberPrinter.class);
    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
    private AtomicInteger counter = new AtomicInteger(1);
    private volatile boolean isRunning = true; // Use volatile to ensure thread safety

    //@PostConstruct
    public void startPrinter() {
        executorService.scheduleAtFixedRate(() -> {
            if(isRunning){
              logger.info("Number: " + counter.getAndIncrement());
              if(counter.get() > 5){
                  counter.set(1);
              }
            }
        }, 0, 1, TimeUnit.SECONDS);
        logger.info("Number printer started!");
    }

    @PreDestroy
    public void stopPrinter() {
        isRunning = false;
        executorService.shutdown();
        logger.info("Number printer stopped!");
    }
} 
