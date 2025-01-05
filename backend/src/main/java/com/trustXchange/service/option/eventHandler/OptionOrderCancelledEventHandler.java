package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.OptionContractMeta;
import com.trustXchange.service.option.eventData.OptionOrderCancelledEventData;
import com.trustXchange.repository.option.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;


@Component
public class OptionOrderCancelledEventHandler  {
    @Autowired
    private OptionOrderRepository OptionOrderRepository;
    @Autowired
    private OptionUserBalanceRepository OptionUserBalanceRepository;

    // todo, add event
    public void handle(OptionOrderCancelledEventData event) {
         if (event.getOrderType() == OptionContractMeta.TYPE_SELL_CALL || event.getOrderType() == OptionContractMeta.TYPE_SELL_PUT) {
                Optional<OptionOrder> maybeOptionOrder = OptionOrderRepository.findById(event.getOrderId());
                if (maybeOptionOrder.isPresent()) {
                    OptionOrder OptionOrder = maybeOptionOrder.get();
                    OptionOrder.setCancelled(true);
                    OptionOrderRepository.save(OptionOrder);
                    Long optionId = OptionOrder.getOptionId();
                    
                    Optional<OptionUserBalance> existingUserBalance = OptionUserBalanceRepository.findByOptionIdAndUserAddress(optionId, event.getPosterAddress());
                    if(existingUserBalance.isPresent()) {
                        OptionUserBalance OptionUserBalance = existingUserBalance.get();
                        OptionUserBalance.setSellingAmount(OptionUserBalance.getSellingAmount() - event.getAmount());
                        OptionUserBalance.setOwnedAmount(OptionUserBalance.getOwnedAmount() + event.getAmount());
                        OptionUserBalanceRepository.save(OptionUserBalance);
                    } 
                }
            } else if (event.getOrderType() == OptionContractMeta.TYPE_BUY_CALL || event.getOrderType() == OptionContractMeta.TYPE_BUY_PUT) {
                Optional<OptionOrder> maybeOptionOrder = OptionOrderRepository.findById(event.getOrderId());
                if (maybeOptionOrder.isPresent()) {
                    OptionOrder OptionOrder = maybeOptionOrder.get();
                    OptionOrder.setCancelled(true);
                    OptionOrderRepository.save(OptionOrder);
                }
            } 

    }
}