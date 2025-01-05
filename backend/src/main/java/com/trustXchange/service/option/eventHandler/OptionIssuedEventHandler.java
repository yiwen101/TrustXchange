package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
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


      if (!maybyOption.isPresent()) {
          Option option = new Option();
          option.setOptionType(optionType);
          option.setStrikePrice(event.getStrikePrice());
          option.setExpiryDate(OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));
          option = optionRepository.save(option);
      }
      Option option = maybyOption.get();

        OptionEvent optionEvent = new OptionEvent();
        optionEvent.setTransactionHash(event.getTransactionHash());
        optionEvent.setTransactionUrl(event.getTransactionUrl());
        optionEvent.setAction(OptionActionType.ISSUE);
        optionEvent.setOptionId(option.getId());
        optionEvent.setAddress(event.getSourceAddress());
        optionEvent.setAmount(event.getAmount());
        optionEventRepository.save(optionEvent);

        Optional<OptionUserBalance> existingUserBalance = OptionUserBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getSourceAddress());
            OptionUserBalance OptionUserBalance = existingUserBalance.orElse(new OptionUserBalance());
            if (OptionUserBalance.getId() == null) {
                OptionUserBalance.setOptionId(option.getId());
                OptionUserBalance.setUserAddress(event.getSourceAddress());
                OptionUserBalance.setOwnedAmount(event.getAmount());
                OptionUserBalance.setSellingAmount(0L);
                OptionUserBalance.setIssuedAmount(event.getAmount());
                OptionUserBalance.setExercisedAmount(0L);
            } else {
              OptionUserBalance.setIssuedAmount(OptionUserBalance.getIssuedAmount() + event.getAmount());
              OptionUserBalance.setOwnedAmount(OptionUserBalance.getOwnedAmount() + event.getAmount());
            }
         OptionUserBalanceRepository.save(OptionUserBalance);
    }
}