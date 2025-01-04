package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.eventData.OptionIssuedEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
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

        Option option =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), new Timestamp(event.getExpiryWeeks() *  7* 24 * 60 * 60 * 1000 + 1704508800000L));

        if (option.getId() == null) {
             option.setOptionType(optionType);
             option.setStrikePrice(event.getStrikePrice());
             option.setExpiryDate(new Timestamp(event.getExpiryWeeks() *  7* 24 * 60 * 60 * 1000 + 1704508800000L));
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
                userOptionBalance.setOwnedAmount(0L);
                userOptionBalance.setSellingAmount(0L);
                userOptionBalance.setIssuedAmount(event.getAmount());
            } else {
              userOptionBalance.setIssuedAmount(userOptionBalance.getIssuedAmount() + event.getAmount());
            }
         userOptionBalanceRepository.save(userOptionBalance);

    }
}