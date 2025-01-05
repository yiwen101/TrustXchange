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
    private UserOptionBalanceRepository userOptionBalanceRepository;

    public void handle(OptionIssuedEventData event) {
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
        optionEvent.setAction("issue");
        optionEvent.setOptionId(option.getId());
        optionEvent.setAddress(event.getSourceAddress());
        optionEvent.setAmount(event.getAmount());
        optionEventRepository.save(optionEvent);

        Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getSourceAddress());
            UserOptionBalance userOptionBalance = existingUserBalance.orElse(new UserOptionBalance());
            if (userOptionBalance.getId() == null) {
                userOptionBalance.setOptionId(option.getId());
                userOptionBalance.setUserAddress(event.getSourceAddress());
                userOptionBalance.setOwnedAmount(event.getAmount());
                userOptionBalance.setSellingAmount(0L);
                userOptionBalance.setIssuedAmount(event.getAmount());
                userOptionBalance.setExercisedAmount(0L);
            } else {
              userOptionBalance.setIssuedAmount(userOptionBalance.getIssuedAmount() + event.getAmount());
              userOptionBalance.setOwnedAmount(userOptionBalance.getOwnedAmount() + event.getAmount());
            }
         userOptionBalanceRepository.save(userOptionBalance);
    }
}