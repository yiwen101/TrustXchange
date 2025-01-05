package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.eventData.OptionTradeExecutedEventData;
import com.trustXchange.repository.option.*;

import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.util.Optional;

@Component
public class OptionTradeExecutedEventHandler  {
     @Autowired
    private OptionRepository optionRepository;
      @Autowired
    private TradeEventRepository tradeEventRepository;
      @Autowired
    private SellOrderRepository sellOrderRepository;
      @Autowired
    private BuyOrderRepository buyOrderRepository;
    @Autowired
    private UserOptionBalanceRepository userOptionBalanceRepository;

    public void handle(OptionTradeExecutedEventData event) {

       String optionType =  (event.getOptionId() == 1 || event.getOptionId() == 2)? "call": "put";
        Option option =  optionRepository.findByOptionTypeAndStrikePriceAndExpiryDate(optionType, event.getStrikePrice(), new Timestamp(event.getExpiryWeeks() *  7* 24 * 60 * 60 * 1000 + 1704508800000L));

        if (option.getId() == null) {
             option.setOptionType(optionType);
             option.setStrikePrice(event.getStrikePrice());
            option.setExpiryDate(new Timestamp(event.getExpiryWeeks() *  7* 24 * 60 * 60 * 1000 + 1704508800000L));
            option = optionRepository.save(option);
        }

           TradeEvent tradeEvent = new TradeEvent();
          tradeEvent.setTransactionHash(event.getTransactionHash());
          tradeEvent.setTransactionUrl(event.getTransactionUrl());
          tradeEvent.setOptionId(option.getId());
          tradeEvent.setSellOrderId(event.getSellOrderId());
          tradeEvent.setBuyOrderId(event.getBuyOrderId());
           tradeEvent.setBuyerAddress(event.getBuyerAddress());
          tradeEvent.setSellerAddress(event.getSellerAddress());
          tradeEvent.setDealPrice(event.getPrice());
          tradeEvent.setAmount(event.getAmount());
          tradeEventRepository.save(tradeEvent);

          Long buyOrderId = event.getBuyOrderId().longValue();
          Long sellOrderId = event.getSellOrderId().longValue();

           Optional<SellOrder> sellOrderOptional = sellOrderRepository.findById(sellOrderId);

          if (sellOrderOptional.isPresent()){
              SellOrder sellOrder = sellOrderOptional.get();
              sellOrder.setFilledAmount(sellOrder.getFilledAmount() + event.getAmount());
              sellOrderRepository.save(sellOrder);

              Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(sellOrder.getOptionId(), sellOrder.getSellerAddress());
              if(existingUserBalance.isPresent()) {
                  UserOptionBalance userOptionBalance = existingUserBalance.get();
                  userOptionBalance.setSellingAmount(userOptionBalance.getSellingAmount() - event.getAmount());
                  userOptionBalance.setOwnedAmount(userOptionBalance.getOwnedAmount() + event.getAmount());
                  userOptionBalanceRepository.save(userOptionBalance);
              }
          }

          Optional<BuyOrder> buyOrderOptional =  buyOrderRepository.findById(buyOrderId);

          if (buyOrderOptional.isPresent()) {
              BuyOrder buyOrder = buyOrderOptional.get();
              buyOrder.setFilledAmount(buyOrder.getFilledAmount() + event.getAmount());
              buyOrderRepository.save(buyOrder);
              
              Optional<UserOptionBalance> existingUserBalance = userOptionBalanceRepository.findByOptionIdAndUserAddress(buyOrder.getOptionId(), buyOrder.getBuyerAddress());
              UserOptionBalance buyerProfile;
              if(existingUserBalance.isPresent()) {
                  buyerProfile = existingUserBalance.get();
                  buyerProfile.setOwnedAmount(buyerProfile.getOwnedAmount() + event.getAmount());
              } else {
                  buyerProfile = new UserOptionBalance();
                  buyerProfile.setOptionId(buyOrder.getOptionId());
                  buyerProfile.setUserAddress(buyOrder.getBuyerAddress());
                  buyerProfile.setOwnedAmount(event.getAmount());
                  buyerProfile.setSellingAmount(0L);
                  buyerProfile.setIssuedAmount(0L);
                  buyerProfile.setExercisedAmount(0L);
              }
              userOptionBalanceRepository.save(buyerProfile);
          }
    }
}