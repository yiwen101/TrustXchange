package com.trustXchange.service.pledge.eventManager;

import com.trustXchange.entities.pledge.PoolLendingPoolEvents;
import com.trustXchange.repository.pledge.PoolLendingPoolEventsRepository;
import com.trustXchange.service.pledge.PledgeEventManagerRegistry;
import com.trustXchange.service.pledge.eventData.PoolRewardEventData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import javax.annotation.PostConstruct;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;


@Component
public class PoolRewardEventManager  extends PledgeEventManager<PoolRewardEventData> {
     @Autowired
    private PoolLendingPoolEventsRepository poolLendingPoolEventsRepository;

    @Autowired
    private PledgeEventManagerRegistry eventManagerRegistry;

    public static final Event POOL_REWARD_EVENT = new Event(
            "PoolRewardEvent",
            Arrays.asList(
                    new TypeReference<Uint256>(false) {}, // rewardDistributed
                    new TypeReference<Uint256>(false) {}, // accRewardPerShareE18
                    new TypeReference<Uint256>(false) {}, // equity
                    new TypeReference<Uint256>(false) {}  // retainedEarning
            )
    );


    @Autowired
    public PoolRewardEventManager() {
        super(POOL_REWARD_EVENT);
    }


    @Override
    public PoolRewardEventData decode(Log log) {
        List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        BigInteger rewardDistributed = (BigInteger) nonIndexedValues.get(0);
        BigInteger accRewardPerShareE18 = (BigInteger) nonIndexedValues.get(1);
        BigInteger equity = (BigInteger) nonIndexedValues.get(2);
        BigInteger retainedEarning = (BigInteger) nonIndexedValues.get(3);

        return new PoolRewardEventData(
                rewardDistributed,
                accRewardPerShareE18,
                equity,
                retainedEarning
        );
    }


     @Override
    public void handle(PoolRewardEventData eventData) {
        PoolLendingPoolEvents poolLendingPoolEvents = new PoolLendingPoolEvents();
        poolLendingPoolEvents.setRewardDistributed(eventData.getRewardDistributed().longValue());
        poolLendingPoolEvents.setAccRewardPerShareE18(eventData.getAccRewardPerShareE18().longValue());
         poolLendingPoolEvents.setEquity(eventData.getEquity().longValue());
         poolLendingPoolEvents.setRetainedEarning(eventData.getRetainedEarning().longValue());
        poolLendingPoolEventsRepository.save(poolLendingPoolEvents);
    }


    @PostConstruct
    private void register(){
        eventManagerRegistry.register(this);
    }
}