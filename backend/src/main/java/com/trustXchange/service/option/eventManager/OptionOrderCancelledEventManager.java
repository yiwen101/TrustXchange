package com.trustXchange.service.option.eventManager;

import com.trustXchange.service.option.eventData.OptionOrderCancelledEventData;
import com.trustXchange.service.option.OptionEventManagerRegistry;
import com.trustXchange.service.option.eventHandler.OptionOrderCancelledEventHandler;
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
public class OptionOrderCancelledEventManager extends OptionEventManager<OptionOrderCancelledEventData> {
    @Autowired
    private OptionEventManagerRegistry eventManagerRegistry;
    @Autowired
    private OptionOrderCancelledEventHandler optionOrderCancelledEventHandler;

    public static final Event OPTION_ORDER_CANCELLED_EVENT = new Event(
        "OptionOrderCancelled",
        Arrays.asList(
                 new TypeReference<Uint256>(false) {},
                  new TypeReference<Utf8String>(false) {},
                 new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                 new TypeReference<Int>(false) {}
        )
    );


     @Autowired
    public OptionOrderCancelledEventManager() {
        super(OPTION_ORDER_CANCELLED_EVENT);
    }

    @Override
    public OptionOrderCancelledEventData decode(Log log) {
            List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
          BigInteger orderId = (BigInteger) nonIndexedValues.get(0);
        String posterAddress = (String) nonIndexedValues.get(1);
        BigInteger strikePrice = (BigInteger) nonIndexedValues.get(2);
         BigInteger expiryWeeks = (BigInteger) nonIndexedValues.get(3);
           BigInteger amount = (BigInteger) nonIndexedValues.get(4);
        int orderType = (Integer) nonIndexedValues.get(5);

       return new OptionOrderCancelledEventData(
            orderId.longValue(),
            posterAddress,
            strikePrice.longValue(),
            expiryWeeks.longValue(),
            amount.longValue(),
            orderType
        );
    }

    @Override
    public void handle(OptionOrderCancelledEventData eventData) {
        optionOrderCancelledEventHandler.handle(eventData);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}