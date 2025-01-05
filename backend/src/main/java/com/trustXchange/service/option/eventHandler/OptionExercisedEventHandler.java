package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.OptionContractMeta;
import com.trustXchange.service.option.eventData.OptionExercisedEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OptionExercisedEventHandler  {
     @Autowired
    private OptionRepository optionRepository;
      @Autowired
    private OptionEventRepository optionEventRepository;
     @Autowired
    private UserOptionBalanceRepository userOptionBalanceRepository;

    public void handle(OptionExercisedEventData event) {

      String optionType = event.isCall() ? "call": "put";
        Option option =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));

          if (option.getId() == null) {
             option.setOptionType(optionType);
             option.setStrikePrice(event.getStrikePrice());
             option.setExpiryDate(OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));
             option = optionRepository.save(option);
        }

         OptionEvent optionEvent = new OptionEvent();
          optionEvent.setTransactionHash(event.getTransactionHash());
          optionEvent.setTransactionUrl(event.getTransactionUrl());
         optionEvent.setAction("exercise");
         optionEvent.setOptionId(option.getId());
         optionEvent.setAddress(event.getSourceAddress());
         optionEvent.setAmount(event.getAmount());
          optionEventRepository.save(optionEvent);

        Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getSourceAddress());
        if(existingUserBalance.isPresent()) {
            UserOptionBalance userOptionBalance = existingUserBalance.get();
            userOptionBalance.setOwnedAmount(userOptionBalance.getOwnedAmount() - event.getAmount());
            userOptionBalance.setExercisedAmount(userOptionBalance.getExercisedAmount() + event.getAmount());
            userOptionBalanceRepository.save(userOptionBalance);
        }

    }
}