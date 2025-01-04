package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.eventData.OptionOrderCancelledEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;


@Component
public class OptionOrderCancelledEventHandler  {
    @Autowired
    private SellOrderRepository sellOrderRepository;
     @Autowired
    private BuyOrderRepository buyOrderRepository;
    @Autowired
    private UserOptionBalanceRepository userOptionBalanceRepository;

    public void handle(OptionOrderCancelledEventData event) {

         if (event.getOrderType() == 1 ) {
              sellOrderRepository.deleteById(event.getOrderId());
               Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(event.getStrikePrice(), event.getPosterAddress());
                if(existingUserBalance.isPresent()) {
                   UserOptionBalance userOptionBalance = existingUserBalance.get();
                    userOptionBalance.setSellingAmount(userOptionBalance.getSellingAmount() - event.getAmount());
                    userOptionBalanceRepository.save(userOptionBalance);
                }


        }  else if (event.getOrderType() == 2) {
             buyOrderRepository.deleteById(event.getOrderId());
        } else if (event.getOrderType() == 3) {
           sellOrderRepository.deleteById(event.getOrderId());
           Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(event.getStrikePrice(), event.getPosterAddress());
           if(existingUserBalance.isPresent()) {
               UserOptionBalance userOptionBalance = existingUserBalance.get();
               userOptionBalance.setSellingAmount(userOptionBalance.getSellingAmount() - event.getAmount());
               userOptionBalanceRepository.save(userOptionBalance);
           }
        } else if (event.getOrderType() == 4) {
             buyOrderRepository.deleteById(event.getOrderId());
        }

    }
}