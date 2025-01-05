package com.trustXchange.service.option.eventManager;

import com.trustXchange.service.option.eventData.OptionTradeExecutedEventData;
import com.trustXchange.service.option.OptionEventManagerRegistry;
import com.trustXchange.service.option.eventHandler.OptionTradeExecutedEventHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;
import javax.annotation.PostConstruct;

@Component
public class OptionTradeExecutedEventManager extends OptionEventManager<OptionTradeExecutedEventData> {
    @Autowired
    private OptionEventManagerRegistry eventManagerRegistry;
    @Autowired
    private OptionTradeExecutedEventHandler optionTradeExecutedEventHandler;


    public static final Event OPTION_TRADE_EXECUTED_EVENT = new Event(
        "OptionTradeExecuted",
        Arrays.asList(
                new TypeReference<Utf8String>(false) {},
                   new TypeReference<Utf8String>(false) {},
                     new TypeReference<Uint256>(false) {},
                 new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                 new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {}
        )
    );


     @Autowired
    public OptionTradeExecutedEventManager() {
        super(OPTION_TRADE_EXECUTED_EVENT);
    }

    @Override
    public OptionTradeExecutedEventData decode(Log log) {
        List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        String buyerAddress = (String) nonIndexedValues.get(0);
        String sellerAddress = (String) nonIndexedValues.get(1);
        BigInteger optionId = (BigInteger) nonIndexedValues.get(2);
       BigInteger strikePrice = (BigInteger) nonIndexedValues.get(3);
         BigInteger expiryWeeks = (BigInteger) nonIndexedValues.get(4);
         BigInteger price = (BigInteger) nonIndexedValues.get(5);
        BigInteger amount = (BigInteger) nonIndexedValues.get(6);
        BigInteger buyOrderId = (BigInteger) nonIndexedValues.get(7);
        BigInteger sellerOrderId = (BigInteger) nonIndexedValues.get(8);

       return new OptionTradeExecutedEventData(
                buyerAddress,
                sellerAddress,
                optionId.longValue(),
                strikePrice.longValue(),
                expiryWeeks.longValue(),
                price.longValue(),
                amount.longValue(),
                buyOrderId.longValue(),
                sellerOrderId.longValue()
        );
    }

    @Override
    public void handle(OptionTradeExecutedEventData eventData) {
      optionTradeExecutedEventHandler.handle(eventData);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}