package com.trustXchange.service.option.eventHandler;

import com.trustXchange.entities.option.*;
import com.trustXchange.entities.option.type.OptionTradeEventType;
import com.trustXchange.service.option.eventData.OptionTradeExecutedEventData;
import com.trustXchange.repository.option.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OptionTradeExecutedEventHandler  {
      @Autowired
    private OptionOrderEventRepository OptionTradeEventRepository;
      @Autowired
    private OptionOrderRepository OptionOrderRepository;
    @Autowired
    private OptionUserBalanceRepository OptionUserBalanceRepository;

    public void handle(OptionTradeExecutedEventData event) {
      Long sellOrderId = event.getSellOrderId();
      Long buyOrderId = event.getBuyOrderId();

      Optional<OptionOrder> maybeSellOrder = OptionOrderRepository.findById(sellOrderId);
      Optional<OptionOrder> maybeBuyOrder = OptionOrderRepository.findById(buyOrderId);
      if (!maybeSellOrder.isPresent() || !maybeBuyOrder.isPresent()) {
          return;
      }
      OptionOrder sellOrder = maybeSellOrder.get();
      OptionOrder buyOrder = maybeBuyOrder.get();

      Optional<OptionUserBalance> maybeSeller = OptionUserBalanceRepository.findByOptionIdAndUserAddress(sellOrder.getOptionId(), sellOrder.getPosterAddress());
      Optional<OptionUserBalance> maybeBuyer = OptionUserBalanceRepository.findByOptionIdAndUserAddress(buyOrder.getOptionId(), buyOrder.getPosterAddress());
      if (!maybeSeller.isPresent() || !maybeBuyer.isPresent()) {
          return;
      }

      // handle sell order, create event, update order, update user balance
      OptionOrderEvent OptionTradeEvent = new OptionOrderEvent();
      OptionTradeEvent.setTransactionHash(event.getTransactionHash());
      OptionTradeEvent.setTransactionUrl(event.getTransactionUrl());
      OptionTradeEvent.setOptionId(sellOrder.getOptionId());
      OptionTradeEvent.setOrderId(sellOrderId);;
      OptionTradeEvent.setPosterAddress(event.getSellerAddress());
      OptionTradeEvent.setDealPrice(event.getPrice());
      OptionTradeEvent.setAmount(event.getAmount());
      OptionTradeEvent.setAction(OptionTradeEventType.FILL);
      OptionTradeEventRepository.save(OptionTradeEvent);

      sellOrder.setFilledAmount(sellOrder.getFilledAmount() + event.getAmount());
      OptionOrderRepository.save(sellOrder);
      
      OptionUserBalance seller = maybeSeller.get();
      seller.setSellingAmount(seller.getSellingAmount() - event.getAmount());
      OptionUserBalanceRepository.save(seller);

      // update buy order, create event, update order, update user balance
      OptionOrderEvent buyOrderFilledEvent = new OptionOrderEvent();
      buyOrderFilledEvent.setTransactionHash(event.getTransactionHash());
      buyOrderFilledEvent.setTransactionUrl(event.getTransactionUrl());
      buyOrderFilledEvent.setOptionId(buyOrder.getOptionId());
      buyOrderFilledEvent.setOrderId(buyOrderId);
      buyOrderFilledEvent.setPosterAddress(event.getBuyerAddress());
      buyOrderFilledEvent.setDealPrice(event.getPrice());
      buyOrderFilledEvent.setAmount(event.getAmount());
      buyOrderFilledEvent.setAction(OptionTradeEventType.FILL);
      OptionTradeEventRepository.save(buyOrderFilledEvent);

      buyOrder.setFilledAmount(buyOrder.getFilledAmount() + event.getAmount());
      OptionOrderRepository.save(buyOrder);

      OptionUserBalance buyer = maybeBuyer.get();
      buyer.setOwnedAmount(buyer.getOwnedAmount() + event.getAmount());
      OptionUserBalanceRepository.save(buyer);
    }
}