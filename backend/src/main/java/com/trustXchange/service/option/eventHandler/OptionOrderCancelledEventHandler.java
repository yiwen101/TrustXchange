package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.entities.option.type.OptionOrderType;
import com.trustXchange.entities.option.type.OptionTradeEventType;
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
    @Autowired
    private OptionOrderEventRepository optionOrderEventRepository;

    public void handle(OptionOrderCancelledEventData event) {
        Optional<OptionOrder> maybeOptionOrder = OptionOrderRepository.findById(event.getOrderId());
        if (!maybeOptionOrder.isPresent()) {
            return;
        }
        OptionOrder optionOrder = maybeOptionOrder.get();
        optionOrder.setCancelled(true);
        optionOrder = OptionOrderRepository.save(optionOrder);

        OptionOrderEvent optionOrderEvent = new OptionOrderEvent();
        optionOrderEvent.setTransactionHash(event.getTransactionHash());
        optionOrderEvent.setTransactionUrl(event.getTransactionUrl());
        optionOrderEvent.setOptionId(optionOrder.getOptionId());
        optionOrderEvent.setPosterAddress(event.getPosterAddress());
        optionOrderEvent.setOrderId(optionOrder.getId());
        optionOrderEvent.setDealPrice(0L);
        optionOrderEvent.setAmount(event.getAmount());
        optionOrderEvent.setAction(OptionTradeEventType.CANCEL);
        optionOrderEventRepository.save(optionOrderEvent);

        if(optionOrder.getOrderType() == OptionOrderType.SELL) {
            Optional<OptionUserBalance> maybeSeller = OptionUserBalanceRepository.findByOptionIdAndUserAddress(optionOrder.getOptionId(), optionOrder.getPosterAddress());
            if (maybeSeller.isPresent()) {
                OptionUserBalance seller = maybeSeller.get();
                seller.setSellingAmount(seller.getSellingAmount() - event.getAmount());
                seller.setOwnedAmount(seller.getOwnedAmount() + event.getAmount());
                OptionUserBalanceRepository.save(seller);
            }
        }


    }
}