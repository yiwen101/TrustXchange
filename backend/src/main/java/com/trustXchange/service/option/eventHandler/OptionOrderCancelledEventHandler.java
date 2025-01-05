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
    private SellOrderRepository sellOrderRepository;
     @Autowired
    private BuyOrderRepository buyOrderRepository;
    @Autowired
    private UserOptionBalanceRepository userOptionBalanceRepository;

    public void handle(OptionOrderCancelledEventData event) {
         if (event.getOrderType() == OptionContractMeta.TYPE_SELL_CALL || event.getOrderType() == OptionContractMeta.TYPE_SELL_PUT) {
                Optional<SellOrder> maybeSellOrder = sellOrderRepository.findById(event.getOrderId());
                if (maybeSellOrder.isPresent()) {
                    SellOrder sellOrder = maybeSellOrder.get();
                    sellOrder.setIsCancelled(true);
                    sellOrderRepository.save(sellOrder);
                    Long optionId = sellOrder.getOptionId();
                    
                    Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(optionId, event.getPosterAddress());
                    if(existingUserBalance.isPresent()) {
                        UserOptionBalance userOptionBalance = existingUserBalance.get();
                        userOptionBalance.setSellingAmount(userOptionBalance.getSellingAmount() - event.getAmount());
                        userOptionBalance.setOwnedAmount(userOptionBalance.getOwnedAmount() + event.getAmount());
                        userOptionBalanceRepository.save(userOptionBalance);
                    } 
                }
            } else if (event.getOrderType() == OptionContractMeta.TYPE_BUY_CALL || event.getOrderType() == OptionContractMeta.TYPE_BUY_PUT) {
                Optional<BuyOrder> maybeBuyOrder = buyOrderRepository.findById(event.getOrderId());
                if (maybeBuyOrder.isPresent()) {
                    BuyOrder buyOrder = maybeBuyOrder.get();
                    buyOrder.setIsCancelled(true);
                    buyOrderRepository.save(buyOrder);
                }
            } 

    }
}