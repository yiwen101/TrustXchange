package com.trustXchange.service;

import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import com.trustXchange.NumberPrinter;
import com.trustXchange.service.common.EventManager;
import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.p2p.P2PEventManagerRegistry;
import com.trustXchange.service.pledge.PledgeEventManagerRegistry;

import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthLog;
import org.web3j.protocol.core.methods.response.Log;
import org.checkerframework.checker.units.qual.C;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.EventValues;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;

import io.reactivex.disposables.Disposable;

import java.math.BigInteger;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Component
public class EventListener {
    @Autowired
    private P2PEventManagerRegistry p2pEventManagerRegistry;
    @Autowired
    private PledgeEventManagerRegistry pledgeEventManagerRegistry;

    private static final Logger logger = LoggerFactory.getLogger(EventListener.class);
     private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
     private volatile boolean isRunning = true; 

    private static final String RPC_URL = "https://rpc-evm-sidechain.xrpl.org";
    private static final String P2P_CONTRACT_ADDRESS = "0x99006642Dc5F79eBeF9dCAf3e95bd7DA0452C58E";
    private static final String PLEDGE_CONTRACT_ADDRESS = "0x83ABF2594aEDf109E2fD83C94FA23b5d9E38340e";
    private long lastProcessedBlock = -1;

    @PostConstruct
    public void listenFor()  {
        //logger.info("EventListener started");
        executorService.scheduleAtFixedRate(() -> temp(pledgeEventManagerRegistry,PLEDGE_CONTRACT_ADDRESS), 0, 1, TimeUnit.SECONDS);
        executorService.scheduleAtFixedRate(() -> temp(p2pEventManagerRegistry,P2P_CONTRACT_ADDRESS), 0, 1, TimeUnit.SECONDS);
        /* 
        // Then listen for new events as they come
        Disposable subscription = web3j.ethLogFlowable(historicFilter).subscribe(log -> {
                    String eventHash = log.getTopics().get(0);
                    if (eventHash.equals(MY_EVENT_HASH)) {
                        EventValues eventValues = extractEventParameters(event, log);
                        Utf8String arg1 = (Utf8String) eventValues.getNonIndexedValues().get(0);
                        System.out.printf("Event: %s %s\n", eventName, arg1);
                    }   
                   
                });
                Instant endTime = Instant.now().plus(Duration.ofMinutes(minutes));
                while (Instant.now().isBefore(endTime)) {
                    Thread.sleep(1000);
                }
                subscription.dispose();
                */
        }

        private void temp(EventManagerRegistry eventManagerRegistry,String contractAddress) {
                try{
            logger.info("EventListener called");
            Web3j web3j = Web3j.build(new HttpService(RPC_URL));

            long latestBlock = web3j.ethBlockNumber().send().getBlockNumber().longValue();
            long fromBlock = lastProcessedBlock + 1;
            if (lastProcessedBlock < 0) {
                fromBlock = latestBlock - 3000;
            } 
            long toBlock = latestBlock;
            EthFilter historicFilter = new EthFilter(
                DefaultBlockParameter.valueOf(BigInteger.valueOf(fromBlock)),
                DefaultBlockParameter.valueOf(BigInteger.valueOf(toBlock)),
                contractAddress
            );
            List<EventManager> eventManagers = eventManagerRegistry.getEventManagers();
            EthLog ethLog = web3j.ethGetLogs(historicFilter).send();
            for (EthLog.LogResult<?> logResult : ethLog.getLogs()) {
                Log log = (Log) logResult.get();
                eventManagers.forEach(eventManager -> eventManager.manage(log));
                };

            lastProcessedBlock = toBlock;
            } catch (Exception e) {
                logger.error("Error in EventListener", e);
            }
        }
        
        

            
    private  EventValues extractEventParameters(Event event, Log log) {
        List<Type> indexedValues = new ArrayList<>();
        List<Type> nonIndexedValues = new ArrayList<>();
        /* 
        List<TypeReference<Type>> indexedParameters = event.getIndexedParameters();
        List<TypeReference<Type>> nonIndexedParameters = event.getNonIndexedParameters();

        // Decode indexed values
        for (int i = 0; i < indexedParameters.size(); i++) {
            String topic = log.getTopics().get(i + 1); // first topic is the event signature
            Type value = FunctionReturnDecoder.decodeIndexedValue(topic, indexedParameters.get(i));
            indexedValues.add(value);
        }

        // Decode non-indexed values
        nonIndexedValues = FunctionReturnDecoder.decode(log.getData(), nonIndexedParameters);
        */
        System.out.println("Log: " + log);
        return new EventValues(indexedValues, nonIndexedValues);
    }

     @PreDestroy
    public void stopPrinter() {
        isRunning = false;
        executorService.shutdown();
        logger.info("EventListener stopped");
    }
}