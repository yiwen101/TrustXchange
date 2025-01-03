package com.trustXchange.service.pledge.eventManager;

import com.trustXchange.entities.pledge.PoolLendingBorrower;
import com.trustXchange.entities.pledge.PoolLendingBorrowerEvents;
import com.trustXchange.repository.pledge.PoolLendingBorrowerEventsRepository;
import com.trustXchange.repository.pledge.PoolLendingBorrowerRepository;
import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.pledge.eventData.BorrowerEventData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import javax.annotation.PostConstruct;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;

@Component
public class BorrowerEventManager  extends PledgeEventManager<BorrowerEventData> {
    @Autowired
    private PoolLendingBorrowerRepository poolLendingBorrowerRepository;

    @Autowired
    private PoolLendingBorrowerEventsRepository poolLendingBorrowerEventsRepository;

    @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event BORROWER_EVENT = new Event(
            "BorrowerEvent",
            Arrays.asList(
                    new TypeReference<Utf8String>(false) {},  // eventName
                    new TypeReference<Uint256>(false) {},    // amount1
                    new TypeReference<Utf8String>(false) {},  // borrower
                    new TypeReference<Uint256>(false) {},    // borrowAmountUSD
                    new TypeReference<Uint256>(false) {},    // amountPayableUSD
                    new TypeReference<Uint256>(false) {},    // collateralAmountXRP
                    new TypeReference<Uint256>(false) {},    // lastPayableUpdateTime
                    new TypeReference<Uint256>(false) {}     // repaidUSD
            )
    );


    @Autowired
    public BorrowerEventManager() {
        super(BORROWER_EVENT);
    }


    @Override
    public BorrowerEventData decode(Log log) {
         List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        String eventName = (String) nonIndexedValues.get(0);
        BigInteger amount = (BigInteger) nonIndexedValues.get(1);
        String borrower = (String) nonIndexedValues.get(2);
        BigInteger borrowAmountUSD = (BigInteger) nonIndexedValues.get(3);
        BigInteger amountPayableUSD = (BigInteger) nonIndexedValues.get(4);
        BigInteger collateralAmountXRP = (BigInteger) nonIndexedValues.get(5);
        BigInteger lastPayableUpdateTime = (BigInteger) nonIndexedValues.get(6);
        BigInteger repaidUSD = (BigInteger) nonIndexedValues.get(7);


        return new BorrowerEventData(
                eventName,
                amount,
                borrower,
                borrowAmountUSD,
                amountPayableUSD,
                collateralAmountXRP,
                lastPayableUpdateTime,
                repaidUSD
        );
    }

     @Override
    public void handle(BorrowerEventData eventData) {
         PoolLendingBorrower poolLendingBorrower = poolLendingBorrowerRepository.findById(eventData.getBorrower()).orElse(null);
         if(poolLendingBorrower == null){
             //if user doesn't exist in db yet, create
             poolLendingBorrower = new PoolLendingBorrower();
             poolLendingBorrower.setBorrowerAddress(eventData.getBorrower());
              poolLendingBorrower.setBorrowAmountUsd(eventData.getBorrowAmountUSD().longValue());
               poolLendingBorrower.setAmountPayableUsd(eventData.getAmountPayableUSD().longValue());
               poolLendingBorrower.setCollateralAmountXrp(eventData.getCollateralAmountXRP().longValue());
              poolLendingBorrower.setLastPayableUpdateTime(null);
              poolLendingBorrower.setRepaidUsd(eventData.getRepaidUSD().longValue());
             poolLendingBorrowerRepository.save(poolLendingBorrower);
         } else {
              poolLendingBorrower.setBorrowAmountUsd(eventData.getBorrowAmountUSD().longValue());
               poolLendingBorrower.setAmountPayableUsd(eventData.getAmountPayableUSD().longValue());
              poolLendingBorrower.setCollateralAmountXrp(eventData.getCollateralAmountXRP().longValue());
               poolLendingBorrower.setRepaidUsd(eventData.getRepaidUSD().longValue());
              poolLendingBorrowerRepository.save(poolLendingBorrower);
         }


        PoolLendingBorrowerEvents poolLendingBorrowerEvents = new PoolLendingBorrowerEvents();
        poolLendingBorrowerEvents.setEventName(eventData.getEventName());
        poolLendingBorrowerEvents.setAmount(eventData.getAmount().longValue());
        poolLendingBorrowerEvents.setBorrowerAddress(eventData.getBorrower());
       poolLendingBorrowerEventsRepository.save(poolLendingBorrowerEvents);


    }

    @PostConstruct
    private void register(){
        eventManagerRegistry.register(this);
    }
}