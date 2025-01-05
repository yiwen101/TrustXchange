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
    private OptionTradeEventRepository OptionTradeEventRepository;
    @Autowired
    private OptionOrderRepository OptionOrderRepository;
    @Autowired
    private OptionOrderRepository OptionOrderRepository;
    @Autowired
    private OptionUserBalanceRepository OptionUserBalanceRepository;
    @Autowired
    private OptionEventRepository optionEventRepository;

    // Get all option data
     @GetMapping
    public ResponseEntity<List<Option>> getAllOptions() {
        return ResponseEntity.ok(optionRepository.findAll());
    }

    // Get the last day, week, month, year's trade events for an option
    @GetMapping("/{optionId}/trade-events")
    public ResponseEntity<List<OptionTradeEvent>> getOptionTradeEvents(
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


        List<OptionTradeEvent> OptionTradeEvents = OptionTradeEventRepository.findByOptionIdAndDealPriceAfter(optionId, startTime);
        return ResponseEntity.ok(OptionTradeEvents);
    }

    // Get the top 5 unfilled, uncanceled buy and sell orders for a particular option
    @GetMapping("/{optionId}/orders")
    public ResponseEntity<?> getTop5Orders(@PathVariable Long optionId) {
        List<OptionOrder> top5OptionOrders = OptionOrderRepository.findTop5ByOptionIdOrderByPriceAsc(optionId);
        List<OptionOrder> top5OptionOrders = OptionOrderRepository.findTop5ByOptionIdOrderByPriceDesc(optionId);
         return ResponseEntity.ok(
                new TopOrdersResponse(top5OptionOrders, top5OptionOrders)
        );
    }


    // Get the number of available, selling, exercised, issued amount a user(address) to an option
     @GetMapping("/{optionId}/user/{address}/balances")
    public ResponseEntity<OptionUserBalanceResponse> getUserBalances(
        @PathVariable Long optionId,
        @PathVariable String address)
     {
         Optional<OptionUserBalance> OptionUserBalanceOptional = OptionUserBalanceRepository.findByOptionIdAndUserAddress(optionId, address);
           OptionUserBalance OptionUserBalance = OptionUserBalanceOptional.orElse(null);
        if(OptionUserBalance == null) {
                return ResponseEntity.notFound().build();
           }

        OptionUserBalanceResponse OptionUserBalanceResponse = new OptionUserBalanceResponse(
                OptionUserBalance.getOwnedAmount(),
                OptionUserBalance.getIssuedAmount(),
                OptionUserBalance.getSellingAmount()

        );
       return ResponseEntity.ok(OptionUserBalanceResponse);
    }

    
    @GetMapping("/{optionId}/user/{address}/sell-orders")
    public ResponseEntity<List<OptionOrder>> getOptionOrdersByUser(
             @PathVariable Long optionId,
             @PathVariable String address)
        {
            List<OptionOrder> OptionOrders = OptionOrderRepository.findByOptionIdAndUserAddressOrderByTimeDesc(optionId, address);
          return ResponseEntity.ok(OptionOrders);
        }

        
      @GetMapping("/{optionId}/user/{address}/buy-orders")
      public ResponseEntity<List<OptionOrder>> getOptionOrdersByUser(
               @PathVariable Long optionId,
                @PathVariable String address)
      {
          List<OptionOrder> OptionOrders = OptionOrderRepository.findByOptionIdAndUserAddressOrderByTimeDesc(optionId, address);
          return ResponseEntity.ok(OptionOrders);
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
        public ResponseEntity<List<OptionTradeEvent>> getOptionTradeEventsByUser(
                @PathVariable Long optionId,
                @PathVariable String address)
         {
             List<OptionTradeEvent> OptionTradeEvents = OptionTradeEventRepository.findByOptionIdAndUserAddress(optionId, address);
              return ResponseEntity.ok(OptionTradeEvents);
         }
}

@Getter
@Setter
@AllArgsConstructor
 class TopOrdersResponse {
      List<OptionOrder> OptionOrders;
       List<OptionOrder> OptionOrders;
 }

@Getter
@Setter
@AllArgsConstructor
 class OptionUserBalanceResponse {
    Long ownedAmount;
    Long issuedAmount;
     Long sellingAmount;
 }