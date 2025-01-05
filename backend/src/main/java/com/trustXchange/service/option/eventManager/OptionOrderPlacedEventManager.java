package com.trustXchange.service.option.eventManager;

import com.trustXchange.service.option.eventData.OptionOrderPlacedEventData;
import com.trustXchange.service.option.OptionEventManagerRegistry;
import com.trustXchange.service.option.eventHandler.OptionOrderPlacedEventHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Int;
import org.web3j.protocol.core.methods.response.Log;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;
import javax.annotation.PostConstruct;


@Component
public class OptionOrderPlacedEventManager extends OptionEventManager<OptionOrderPlacedEventData> {

       @Autowired
    private OptionEventManagerRegistry eventManagerRegistry;
    @Autowired
    private OptionOrderPlacedEventHandler optionOrderPlacedEventHandler;

    public static final Event OPTION_ORDER_PLACED_EVENT = new Event(
        "OptionOrderPlaced",
        Arrays.asList(
                new TypeReference<Uint256>(false) {},
                  new TypeReference<Utf8String>(false) {},
                 new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                   new TypeReference<Uint256>(false) {},
                   new TypeReference<Uint256>(false) {},
                    new TypeReference<Int>(false) {}
        )
    );


     @Autowired
    public OptionOrderPlacedEventManager() {
        super(OPTION_ORDER_PLACED_EVENT);
    }

    @Override
     public OptionOrderPlacedEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
           BigInteger orderId = (BigInteger) nonIndexedValues.get(0);
        String posterAddress = (String) nonIndexedValues.get(1);
        BigInteger strikePrice = (BigInteger) nonIndexedValues.get(2);
         BigInteger expiryWeeks = (BigInteger) nonIndexedValues.get(3);
        BigInteger price = (BigInteger) nonIndexedValues.get(4);
         BigInteger amount = (BigInteger) nonIndexedValues.get(5);
        int orderType = (Integer) nonIndexedValues.get(6);

       return new OptionOrderPlacedEventData(
            orderId.longValue(),
            posterAddress,
            strikePrice.longValue(),
            expiryWeeks.longValue(),
            price.longValue(),
            amount.longValue(),
            orderType
        );
    }


    @Override
    public void handle(OptionOrderPlacedEventData eventData) {
        optionOrderPlacedEventHandler.handle(eventData);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}