package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.OptionContractMeta;
import com.trustXchange.service.option.eventData.OptionCollateralWithdrawnEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OptionCollateralWithdrawnEventHandler  {

    @Autowired
    private OptionRepository optionRepository;
    @Autowired
    private OptionEventRepository optionEventRepository;
    @Autowired
    private OptionUserBalanceRepository OptionUserBalanceRepository;


    public void handle(OptionCollateralWithdrawnEventData event) {

        OptionType optionType = event.isCall() ? OptionType.CALL : OptionType.PUT;
        Optional<Option> maybyOption =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));
        if (!maybyOption.isPresent()) {
            return;
        }
        Option option = maybyOption.get();


        OptionEvent optionEvent = new OptionEvent();
        optionEvent.setTransactionHash(event.getTransactionHash());
        optionEvent.setTransactionUrl(event.getTransactionUrl());
         optionEvent.setAction(OptionActionType.COLLECT_COLLATERAL);
         optionEvent.setOptionId(option.getId());
         optionEvent.setAddress(event.getSourceAddress());
         optionEvent.setAmount(event.getAmount());
        optionEventRepository.save(optionEvent);

       Optional<OptionUserBalance> existingUserBalance = OptionUserBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getSourceAddress());
        if(existingUserBalance.isPresent()) {
            OptionUserBalance OptionUserBalance = existingUserBalance.get();
            OptionUserBalance.setCollateralCollectedAmount(OptionUserBalance.getCollateralCollectedAmount() + event.getAmount());
            OptionUserBalanceRepository.save(OptionUserBalance);
        }
    }
}