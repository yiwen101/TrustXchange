package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.OptionContractMeta;
import com.trustXchange.service.option.eventData.OptionOrderPlacedEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.util.Optional;

@Component
public class OptionOrderPlacedEventHandler  {

    @Autowired
    private OptionRepository optionRepository;
      @Autowired
    private OptionOrderRepository OptionOrderRepository;
    @Autowired
    private OptionUserBalanceRepository OptionUserBalanceRepository;

    public void handle(OptionOrderPlacedEventData event) {
        OptionType optionType = event.getOrderType() == 1 || event.getOrderType() == 2? OptionType.CALL : OptionType.PUT;
        Optional<Option> maybyOption =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));

        if (!maybyOption.isPresent()) {
            Option option = new Option();
            option.setOptionType(optionType);
            option.setStrikePrice(event.getStrikePrice());
            option.setExpiryDate(OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));
            option = optionRepository.save(option);
        }
        Option option = maybyOption.get();


        if (event.getOrderType() == OptionContractMeta.TYPE_SELL_CALL || event.getOrderType() == OptionContractMeta.TYPE_SELL_PUT) {
          OptionOrder OptionOrder = new OptionOrder();
           OptionOrder.setOptionId(option.getId());
           OptionOrder.setPosterAddress(event.getPosterAddress());
           OptionOrder.setPrice(event.getPrice());
            OptionOrder.setAmount(event.getAmount());
            OptionOrder.setFilledAmount(0L);
            OptionOrderRepository.save(OptionOrder);
            
            Optional<OptionUserBalance> existingUserBalance = OptionUserBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getPosterAddress());
            if(existingUserBalance.isPresent()) {
                OptionUserBalance OptionUserBalance = existingUserBalance.get();
                 OptionUserBalance.setSellingAmount(OptionUserBalance.getSellingAmount() + event.getAmount());
                 OptionUserBalance.setOwnedAmount(OptionUserBalance.getOwnedAmount() - event.getAmount());
                OptionUserBalanceRepository.save(OptionUserBalance);
            }

        }  else  {
            OptionOrder OptionOrder = new OptionOrder();
            OptionOrder.setOptionId(option.getId());
           OptionOrder.setPosterAddress(event.getPosterAddress());
           OptionOrder.setPrice(event.getPrice());
            OptionOrder.setAmount(event.getAmount());
           OptionOrder.setFilledAmount(0L);
           OptionOrderRepository.save(OptionOrder);
        }

    }
}