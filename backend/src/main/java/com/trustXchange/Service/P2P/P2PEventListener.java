package com.trustXchange.Service.P2P;

import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import com.trustXchange.Service.P2P.EventData.P2PEventData;

import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthLog;
import org.web3j.protocol.core.methods.response.Log;
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

public class P2PEventListener {
    private static final String RPC_URL = "https://rpc-evm-sidechain.xrpl.org";
    private static final String CONTRACT_ADDRESS = "0x08A7742C58798c1E8a30Cd6042e8F83A93702824";

    public static void listenFor(int minutes) throws Exception {
        Web3j web3j = Web3j.build(new HttpService(RPC_URL));

        long latestBlock = web3j.ethBlockNumber().send().getBlockNumber().longValue();
        long fromBlock = Math.max(0, latestBlock - 2000);

        EthFilter historicFilter = new EthFilter(
            DefaultBlockParameter.valueOf(BigInteger.valueOf(fromBlock)),
                DefaultBlockParameterName.LATEST,
                CONTRACT_ADDRESS
        );

        // Print existing events
        EthLog ethLog = web3j.ethGetLogs(historicFilter).send();
        for (EthLog.LogResult<?> logResult : ethLog.getLogs()) {
            Log web3jLog = (Log) logResult.get();
            String blockNumber = web3jLog.getBlockNumber().toString();
            System.out.printf("Log: on block %s with %s topics\n", blockNumber, web3jLog.getTopics().size());
            Optional<P2PEventData> eventData =  P2PEventDecoder.decode(web3jLog);
            if (eventData.isPresent()) {
                System.out.println("Event: " + eventData.get());
            }
        }
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
        
        

            
    private static EventValues extractEventParameters(Event event, Log log) {
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
}