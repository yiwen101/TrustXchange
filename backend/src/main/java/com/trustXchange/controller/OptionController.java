package com.trustXchange.controller;

import com.trustXchange.entities.option.*;
import com.trustXchange.repository.option.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/options")
public class OptionController {

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
    @Autowired
    private OptionEventRepository optionEventRepository;

    // Get all option data
     @GetMapping
    public ResponseEntity<List<Option>> getAllOptions() {
        return ResponseEntity.ok(optionRepository.findAll());
    }

    // Get the last day, week, month, year's trade events for an option
    @GetMapping("/{optionId}/trade-events")
    public ResponseEntity<List<TradeEvent>> getTradeEvents(
            @PathVariable Long optionId,
            @RequestParam(name = "period", defaultValue = "day") String period) {
             LocalDateTime now = LocalDateTime.now();
           Date startTime = null;

           switch(period) {
                case "week":
                    startTime = Date.from(now.minusWeeks(1).atZone(ZoneId.systemDefault()).toInstant());
                    break;
                 case "month":
                    startTime = Date.from(now.minusMonths(1).atZone(ZoneId.systemDefault()).toInstant());
                    break;
                case "year":
                    startTime = Date.from(now.minusYears(1).atZone(ZoneId.systemDefault()).toInstant());
                    break;
                default:
                  startTime = Date.from(now.minusDays(1).atZone(ZoneId.systemDefault()).toInstant());
                  break;
            }


        List<TradeEvent> tradeEvents = tradeEventRepository.findByOptionIdAndDealPriceAfter(optionId, startTime);
        return ResponseEntity.ok(tradeEvents);
    }

    // Get the top 5 unfilled, uncanceled buy and sell orders for a particular option
    @GetMapping("/{optionId}/orders")
    public ResponseEntity<?> getTop5Orders(@PathVariable Long optionId) {
        List<SellOrder> top5SellOrders = sellOrderRepository.findTop5ByOptionIdOrderByPriceAsc(optionId);
        List<BuyOrder> top5BuyOrders = buyOrderRepository.findTop5ByOptionIdOrderByPriceDesc(optionId);
         return ResponseEntity.ok(
                new TopOrdersResponse(top5SellOrders, top5BuyOrders)
        );
    }


    // Get the number of available, selling, exercised, issued amount a user(address) to an option
     @GetMapping("/{optionId}/user/{address}/balances")
    public ResponseEntity<UserOptionBalanceResponse> getUserBalances(
        @PathVariable Long optionId,
        @PathVariable String address)
     {
         Optional<UserOptionBalance> userOptionBalanceOptional = userOptionBalanceRepository.findByOptionIdAndUserAddress(optionId, address);
           UserOptionBalance userOptionBalance = userOptionBalanceOptional.orElse(null);
        if(userOptionBalance == null) {
                return ResponseEntity.notFound().build();
           }

        UserOptionBalanceResponse userOptionBalanceResponse = new UserOptionBalanceResponse(
                userOptionBalance.getOwnedAmount(),
                userOptionBalance.getIssuedAmount(),
                userOptionBalance.getSellingAmount()

        );
       return ResponseEntity.ok(userOptionBalanceResponse);
    }

    
    @GetMapping("/{optionId}/user/{address}/sell-orders")
    public ResponseEntity<List<SellOrder>> getSellOrdersByUser(
             @PathVariable Long optionId,
             @PathVariable String address)
        {
            List<SellOrder> sellOrders = sellOrderRepository.findByOptionIdAndUserAddressOrderByTimeDesc(optionId, address);
          return ResponseEntity.ok(sellOrders);
        }

        
      @GetMapping("/{optionId}/user/{address}/buy-orders")
      public ResponseEntity<List<BuyOrder>> getBuyOrdersByUser(
               @PathVariable Long optionId,
                @PathVariable String address)
      {
          List<BuyOrder> buyOrders = buyOrderRepository.findByOptionIdAndUserAddressOrderByTimeDesc(optionId, address);
          return ResponseEntity.ok(buyOrders);
        }


     // Get all option events related to an option by an user
      @GetMapping("/{optionId}/user/{address}/option-events")
       public ResponseEntity<List<OptionEvent>> getOptionEventsByUser(
             @PathVariable Long optionId,
             @PathVariable String address)
        {
           List<OptionEvent> optionEvents = optionEventRepository.findByOptionIdAndUserAddress(optionId, address);
            return ResponseEntity.ok(optionEvents);
        }

     // Get all trade events related to an option by an user
       @GetMapping("/{optionId}/user/{address}/trade-events")
        public ResponseEntity<List<TradeEvent>> getTradeEventsByUser(
                @PathVariable Long optionId,
                @PathVariable String address)
         {
             List<TradeEvent> tradeEvents = tradeEventRepository.findByOptionIdAndUserAddress(optionId, address);
              return ResponseEntity.ok(tradeEvents);
         }
}

@Getter
@Setter
@AllArgsConstructor
 class TopOrdersResponse {
      List<SellOrder> sellOrders;
       List<BuyOrder> buyOrders;
 }

@Getter
@Setter
@AllArgsConstructor
 class UserOptionBalanceResponse {
    Long ownedAmount;
    Long issuedAmount;
     Long sellingAmount;
 }