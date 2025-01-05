package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.entities.option.type.OptionActionType;
import com.trustXchange.entities.option.type.OptionType;
import com.trustXchange.service.option.OptionContractMeta;
import com.trustXchange.service.option.eventData.OptionIssuedEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OptionIssuedEventHandler  {

     @Autowired
    private OptionRepository optionRepository;
      @Autowired
    private OptionEventRepository optionEventRepository;
      @Autowired
    private OptionUserBalanceRepository OptionUserBalanceRepository;

    public void handle(OptionIssuedEventData event) {
      OptionType optionType = event.isCall() ? OptionType.CALL : OptionType.PUT;
      Optional<Option> maybyOption =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));

      Option option;
      if (!maybyOption.isPresent()) {
          option = new Option();
          option.setOptionType(optionType);
          option.setStrikePrice(event.getStrikePrice());
          option.setExpiryDate(OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));
          option = optionRepository.save(option);
      } else {
          option = maybyOption.get();
      }

        OptionEvent optionEvent = new OptionEvent();
        optionEvent.setTransactionHash(event.getTransactionHash());
        optionEvent.setTransactionUrl(event.getTransactionUrl());
        optionEvent.setAction(OptionActionType.ISSUE);
        optionEvent.setOptionId(option.getId());
        optionEvent.setAddress(event.getSourceAddress());
        optionEvent.setAmount(event.getAmount());
        optionEventRepository.save(optionEvent);

        Optional<OptionUserBalance> existingUserBalance = OptionUserBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getSourceAddress());
            if (!existingUserBalance.isPresent()) {
                OptionUserBalance OptionUserBalance = new OptionUserBalance();
                
                OptionUserBalance.setUserAddress(event.getSourceAddress());
                OptionUserBalance.setOptionId(option.getId());
                OptionUserBalance.setOwnedAmount(event.getAmount());
                OptionUserBalance.setIssuedAmount(event.getAmount());
                OptionUserBalance.setSellingAmount(0L);
                OptionUserBalance.setExercisedAmount(0L);
                OptionUserBalance.setCollateralCollectedAmount(0L);

                OptionUserBalanceRepository.save(OptionUserBalance);
                return;
            } else {
                OptionUserBalance OptionUserBalance = existingUserBalance.get();
                OptionUserBalance.setOwnedAmount(OptionUserBalance.getOwnedAmount() + event.getAmount());
                OptionUserBalance.setIssuedAmount(OptionUserBalance.getIssuedAmount() + event.getAmount());
                OptionUserBalanceRepository.save(OptionUserBalance);
            }
    }
}