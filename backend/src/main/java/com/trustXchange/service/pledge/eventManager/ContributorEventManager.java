package com.trustXchange.service.pledge.eventManager;

import com.trustXchange.entities.pledge.PoolLendingContributor;
import com.trustXchange.entities.pledge.PoolLendingContributorEvents;
import com.trustXchange.repository.pledge.PoolLendingContributorEventsRepository;
import com.trustXchange.repository.pledge.PoolLendingContributorRepository;
import com.trustXchange.service.pledge.PledgeEventManagerRegistry;
import com.trustXchange.service.pledge.eventData.ContributorEventData;
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
public class ContributorEventManager  extends PledgeEventManager<ContributorEventData> {
    @Autowired
    private PoolLendingContributorRepository poolLendingContributorRepository;

    @Autowired
    private PoolLendingContributorEventsRepository poolLendingContributorEventsRepository;

    @Autowired
    private PledgeEventManagerRegistry eventManagerRegistry;

    public static final Event CONTRIBUTOR_EVENT = new Event(
            "ContributorEvent",
            Arrays.asList(
                    new TypeReference<Utf8String>(false) {}, // eventName
                    new TypeReference<Uint256>(false) {},   // amount1
                    new TypeReference<Utf8String>(false) {},  // user
                    new TypeReference<Uint256>(false) {},    // contributionBalance
                    new TypeReference<Uint256>(false) {},   // rewardDebt
                    new TypeReference<Uint256>(false) {}    // confirmedRewards
            )
    );

    @Autowired
    public ContributorEventManager() {
        super(CONTRIBUTOR_EVENT);
    }

    @Override
    public ContributorEventData decode(Log log) {
        List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        String eventName = (String) nonIndexedValues.get(0);
        BigInteger amount = (BigInteger) nonIndexedValues.get(1);
        String user = (String) nonIndexedValues.get(2);
        BigInteger contributionBalance = (BigInteger) nonIndexedValues.get(3);
        BigInteger rewardDebt = (BigInteger) nonIndexedValues.get(4);
        BigInteger confirmedRewards = (BigInteger) nonIndexedValues.get(5);

        return new ContributorEventData(
                eventName,
                amount,
                user,
                contributionBalance,
                rewardDebt,
                confirmedRewards
        );
    }


    @Override
    public void handle(ContributorEventData eventData) {

        PoolLendingContributor poolLendingContributor = poolLendingContributorRepository.findById(eventData.getUser()).orElse(null);
         if(poolLendingContributor == null) {
             poolLendingContributor = new PoolLendingContributor();
             poolLendingContributor.setAddress(eventData.getUser());
             poolLendingContributor.setContributionBalance(eventData.getContributionBalance().longValue());
             poolLendingContributor.setRewardDebt(eventData.getRewardDebt().longValue());
             poolLendingContributor.setConfirmedRewards(eventData.getConfirmedRewards().longValue());
              poolLendingContributorRepository.save(poolLendingContributor);
         } else {
             poolLendingContributor.setContributionBalance(eventData.getContributionBalance().longValue());
             poolLendingContributor.setRewardDebt(eventData.getRewardDebt().longValue());
             poolLendingContributor.setConfirmedRewards(eventData.getConfirmedRewards().longValue());
             poolLendingContributorRepository.save(poolLendingContributor);
         }


        PoolLendingContributorEvents poolLendingContributorEvents = new PoolLendingContributorEvents();
        poolLendingContributorEvents.setEventName(eventData.getEventName());
        poolLendingContributorEvents.setAmount(eventData.getAmount().longValue());
        poolLendingContributorEvents.setContributorAddress(eventData.getUser());
        poolLendingContributorEventsRepository.save(poolLendingContributorEvents);


    }

    @PostConstruct
    private void register(){
        eventManagerRegistry.register(this);
    }
}