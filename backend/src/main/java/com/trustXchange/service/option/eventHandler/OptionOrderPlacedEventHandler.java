package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.entities.option.type.OptionOrderType;
import com.trustXchange.entities.option.type.OptionTradeEventType;
import com.trustXchange.entities.option.type.OptionType;
import com.trustXchange.service.option.OptionContractMeta;
import com.trustXchange.service.option.eventData.OptionOrderPlacedEventData;
import com.trustXchange.repository.option.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OptionOrderPlacedEventHandler  {

    @Autowired
    private OptionRepository optionRepository;
      @Autowired
    private OptionOrderRepository OptionOrderRepository;
    @Autowired
    private OptionUserBalanceRepository OptionUserBalanceRepository;
    @Autowired
    private OptionOrderEventRepository optionOrderEventRepository;

    public void handle(OptionOrderPlacedEventData event) {
        OptionType optionType = OptionContractMeta.getOptionType(event.getOrderType());
        boolean isSelling = event.getOrderType() == OptionContractMeta.TYPE_SELL_CALL || event.getOrderType() == OptionContractMeta.TYPE_SELL_PUT;
        
        Optional<Option> maybyOption =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));
        Option option;
        if (!maybyOption.isPresent()) {
            if (isSelling) {
                return;
            }
            option = new Option();
            option.setOptionType(optionType);
            option.setStrikePrice(event.getStrikePrice());
            option.setExpiryDate(OptionContractMeta.getExpiryDate(event.getExpiryWeeks()));
            option = optionRepository.save(option);
        } else {
            option = maybyOption.get();
        }
      
        
        // user balance, order, event
        Optional<OptionUserBalance> existingUserBalance = OptionUserBalanceRepository.findByOptionIdAndUserAddress(option.getId(), event.getPosterAddress());
        if (isSelling) {
            if(!existingUserBalance.isPresent()) {
                return;
            }
            OptionUserBalance OptionUserBalance = existingUserBalance.get();
            OptionUserBalance.setSellingAmount(OptionUserBalance.getSellingAmount() + event.getAmount());
            OptionUserBalance.setOwnedAmount(OptionUserBalance.getOwnedAmount() - event.getAmount());
           OptionUserBalanceRepository.save(OptionUserBalance);
        } else if (!existingUserBalance.isPresent()) {
            OptionUserBalance OptionUserBalance = new OptionUserBalance();
                
            OptionUserBalance.setUserAddress(event.getPosterAddress());
            OptionUserBalance.setOptionId(option.getId());
            OptionUserBalance.setOwnedAmount(event.getAmount());
            OptionUserBalance.setIssuedAmount(event.getAmount());
            OptionUserBalance.setSellingAmount(0L);
            OptionUserBalance.setExercisedAmount(0L);
            OptionUserBalance.setCollateralCollectedAmount(0L);

            OptionUserBalanceRepository.save(OptionUserBalance);
        }

        OptionOrder OptionOrder = new OptionOrder();
        OptionOrder.setOptionId(option.getId());
        OptionOrder.setPosterAddress(event.getPosterAddress());
        OptionOrder.setPrice(event.getPrice());
        OptionOrder.setAmount(event.getAmount());
        OptionOrder.setFilledAmount(0L);
        OptionOrder.setOrderType(isSelling ? OptionOrderType.SELL : OptionOrderType.BUY);
        OptionOrder = OptionOrderRepository.save(OptionOrder);

        OptionOrderEvent optionOrderEvent = new OptionOrderEvent();
        optionOrderEvent.setTransactionHash(event.getTransactionHash());
        optionOrderEvent.setTransactionUrl(event.getTransactionUrl());
        optionOrderEvent.setOptionId(option.getId());
        optionOrderEvent.setPosterAddress(event.getPosterAddress());
        optionOrderEvent.setOrderId(OptionOrder.getId());
        optionOrderEvent.setDealPrice(event.getPrice());
        optionOrderEvent.setAmount(event.getAmount());
        optionOrderEvent.setAction(OptionTradeEventType.CREATE);
        optionOrderEventRepository.save(optionOrderEvent);
    }
}