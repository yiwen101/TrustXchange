package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.entities.option.type.OptionActionType;
import com.trustXchange.entities.option.type.OptionType;
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
    private OptionUserBalanceRepository OptionUserBalanceRepository;

    public void handle(OptionExercisedEventData event) {

      OptionType optionType = event.isCall() ? OptionType.CALL : OptionType.PUT;
      Optional<Option> maybyOption =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));


      if (!maybyOption.isPresent()) {
          return;
      }
        Option option = maybyOption.get();
        Optional<OptionUserBalance> existingUserBalance = OptionUserBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getSourceAddress());
        if(!existingUserBalance.isPresent()) {
            return;
        }

        OptionUserBalance OptionUserBalance = existingUserBalance.get();
            OptionUserBalance.setOwnedAmount(OptionUserBalance.getOwnedAmount() - event.getAmount());
            OptionUserBalance.setExercisedAmount(OptionUserBalance.getExercisedAmount() + event.getAmount());
            OptionUserBalanceRepository.save(OptionUserBalance);

         OptionEvent optionEvent = new OptionEvent();
          optionEvent.setTransactionHash(event.getTransactionHash());
          optionEvent.setTransactionUrl(event.getTransactionUrl());
         optionEvent.setAction(OptionActionType.EXERCISE);
         optionEvent.setOptionId(option.getId());
         optionEvent.setAddress(event.getSourceAddress());
         optionEvent.setAmount(event.getAmount());
          optionEventRepository.save(optionEvent);

    }
}