package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.service.option.eventData.OptionTradeExecutedEventData;
import com.trustXchange.repository.option.*;
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
          }

          Optional<BuyOrder> buyOrderOptional =  buyOrderRepository.findById(buyOrderId);

          if (buyOrderOptional.isPresent()) {
              BuyOrder buyOrder = buyOrderOptional.get();
              buyOrder.setFilledAmount(buyOrder.getFilledAmount() + event.getAmount());
              buyOrderRepository.save(buyOrder);
          }
    }
}