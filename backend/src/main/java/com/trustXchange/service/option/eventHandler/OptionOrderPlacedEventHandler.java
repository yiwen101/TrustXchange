package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
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
    private SellOrderRepository sellOrderRepository;
        @Autowired
    private BuyOrderRepository buyOrderRepository;
    @Autowired
    private UserOptionBalanceRepository userOptionBalanceRepository;

    public void handle(OptionOrderPlacedEventData event) {
        String optionType = event.getOrderType() == 1 || event.getOrderType() == 2? "call": "put";
        Option option =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), new Timestamp(event.getExpiryWeeks() *  7* 24 * 60 * 60 * 1000 + 1704508800000L));

           if (option.getId() == null) {
             option.setOptionType(optionType);
             option.setStrikePrice(event.getStrikePrice());
             option.setExpiryDate(new Timestamp(event.getExpiryWeeks() *  7* 24 * 60 * 60 * 1000 + 1704508800000L));
             option = optionRepository.save(option);
        }


        if (event.getOrderType() == 1 || event.getOrderType() == 3) {
          SellOrder sellOrder = new SellOrder();
           sellOrder.setOptionId(option.getId());
           sellOrder.setSellerAddress(event.getPosterAddress());
           sellOrder.setPrice(event.getPrice());
            sellOrder.setAmount(event.getAmount());
            sellOrder.setFilledAmount(0L);
            sellOrderRepository.save(sellOrder);
            Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getPosterAddress());
            if(existingUserBalance.isPresent()) {
                UserOptionBalance userOptionBalance = existingUserBalance.get();
                 userOptionBalance.setSellingAmount(userOptionBalance.getSellingAmount() + event.getAmount());
                userOptionBalanceRepository.save(userOptionBalance);
            }

        }  else  {
            BuyOrder buyOrder = new BuyOrder();
            buyOrder.setOptionId(option.getId());
           buyOrder.setBuyerAddress(event.getPosterAddress());
           buyOrder.setPrice(event.getPrice());
            buyOrder.setAmount(event.getAmount());
           buyOrder.setFilledAmount(0L);
           buyOrderRepository.save(buyOrder);
        }

    }
}