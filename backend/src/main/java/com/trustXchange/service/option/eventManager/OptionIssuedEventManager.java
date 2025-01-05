package com.trustXchange.service.option.eventManager;

import com.trustXchange.service.option.eventData.OptionIssuedEventData;
import com.trustXchange.service.option.OptionEventManagerRegistry;
import com.trustXchange.service.option.eventHandler.OptionIssuedEventHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Bool;
import org.web3j.protocol.core.methods.response.Log;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;
import javax.annotation.PostConstruct;

@Component
public class OptionIssuedEventManager extends OptionEventManager<OptionIssuedEventData>{
      @Autowired
    private OptionEventManagerRegistry eventManagerRegistry;
    @Autowired
    private OptionIssuedEventHandler optionIssuedEventHandler;


    public static final Event OPTION_ISSUED_EVENT = new Event(
        "OptionIssued",
        Arrays.asList(
                new TypeReference<Utf8String>(false) {},
                 new TypeReference<Uint256>(false) {},
                new TypeReference<Uint256>(false) {},
                 new TypeReference<Uint256>(false) {},
                   new TypeReference<Bool>(false) {}

        )
    );

      @Autowired
    public OptionIssuedEventManager() {
        super(OPTION_ISSUED_EVENT);
    }
     @Override
    public OptionIssuedEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        String sourceAddress = (String) nonIndexedValues.get(0);
        BigInteger strikePrice = (BigInteger) nonIndexedValues.get(1);
        BigInteger expiryWeeks = (BigInteger) nonIndexedValues.get(2);
        BigInteger amount = (BigInteger) nonIndexedValues.get(3);
        Boolean isCall = (Boolean) nonIndexedValues.get(4);

       return new OptionIssuedEventData(
            sourceAddress,
            strikePrice.longValue(),
            expiryWeeks.longValue(),
            amount.longValue(),
            isCall
        );
    }

    @Override
    public void handle(OptionIssuedEventData eventData) {
      optionIssuedEventHandler.handle(eventData);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}