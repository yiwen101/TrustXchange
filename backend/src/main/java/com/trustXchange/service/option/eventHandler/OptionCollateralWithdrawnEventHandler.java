package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.eventData.OptionCollateralWithdrawnEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;

@Component
public class OptionCollateralWithdrawnEventHandler  {

      @Autowired
    private OptionRepository optionRepository;
      @Autowired
    private OptionEventRepository optionEventRepository;


    public void handle(OptionCollateralWithdrawnEventData event) {

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
         optionEvent.setAction("collect_collateral");
         optionEvent.setOptionId(option.getId());
         optionEvent.setAddress(event.getSourceAddress());
         optionEvent.setAmount(event.getAmount());
        optionEventRepository.save(optionEvent);
    }
}