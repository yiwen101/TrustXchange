package com.trustXchange.controller;

import com.trustXchange.entities.option.*;
import com.trustXchange.entities.option.type.OptionOrderType;
import com.trustXchange.repository.option.OptionEventRepository;
import com.trustXchange.repository.option.OptionOrderEventRepository;
import com.trustXchange.repository.option.OptionOrderRepository;
import com.trustXchange.repository.option.OptionRepository;
import com.trustXchange.repository.option.OptionUserBalanceRepository;

import java.time.ZoneId;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/options")
public class OptionController {

    @Autowired
    private OptionRepository optionRepository;
    @Autowired
    private OptionOrderEventRepository optionOrderEventRepository;
    @Autowired
    private OptionOrderRepository optionOrderRepository;
    @Autowired
    private OptionUserBalanceRepository optionUserBalanceRepository;
     @Autowired
    private OptionEventRepository optionEventRepository;

    // Get all option data
    @GetMapping
    public ResponseEntity<List<Option>> getAllOptions() {
        return ResponseEntity.ok(optionRepository.findAll());
    }

    // Get the last day, week, month, year's trade events for an option
    @GetMapping("/{optionId}/trade-events")
    public ResponseEntity<List<OptionOrderEvent>> getOptionTradeEvents(
            @PathVariable Long optionId,
            @RequestParam(name = "period", defaultValue = "day") String period) {
        LocalDateTime now = LocalDateTime.now();
        Date startTime = null;

        switch (period) {
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

        List<OptionOrderEvent> optionOrderEvents = optionOrderEventRepository.findByOptionIdOrderByCreatedAtDesc(optionId);

        // Filter for trade events after the startTime
          if (startTime != null) {
            final Date finalStartTime = startTime;
           optionOrderEvents = optionOrderEvents.stream()
           .filter(event -> event.getCreatedAt().after(finalStartTime))
           .collect(Collectors.toList());
          }


        return ResponseEntity.ok(optionOrderEvents);
    }


    // Get the top 5 unfilled, uncanceled buy and sell orders for a particular option
    @GetMapping("/{optionId}/orders")
    public ResponseEntity<?> getTop5Orders(@PathVariable Long optionId) {
      Pageable pageable = PageRequest.of(0, 5);
        //find top 5 unfilled sell orders
        List<OptionOrder> top5SellOrders = optionOrderRepository.findTop5ByOptionIdAndFilledAmountLessThanAndOrderTypeOrderByPriceDesc(optionId, Long.MAX_VALUE, OptionOrderType.SELL, pageable);

        //find top 5 unfilled buy orders
        List<OptionOrder> top5BuyOrders = optionOrderRepository.findTop5ByOptionIdAndFilledAmountLessThanAndOrderTypeOrderByPriceDesc(optionId, Long.MAX_VALUE, OptionOrderType.BUY, pageable);
        
        return ResponseEntity.ok(
                new TopOrdersResponse(top5BuyOrders, top5SellOrders)
        );
    }

    // Get the number of available, selling, exercised, issued amount a user(address) to an option
    @GetMapping("/{optionId}/user/{address}/balances")
    public ResponseEntity<OptionUserBalanceResponse> getUserBalances(
            @PathVariable Long optionId,
            @PathVariable String address) {
        Optional<OptionUserBalance> optionUserBalanceOptional = optionUserBalanceRepository.findByOptionIdAndUserAddress(optionId, address);
        OptionUserBalance optionUserBalance = optionUserBalanceOptional.orElse(null);
        if (optionUserBalance == null) {
            return ResponseEntity.notFound().build();
        }

        OptionUserBalanceResponse optionUserBalanceResponse = new OptionUserBalanceResponse(
                optionUserBalance.getOwnedAmount(),
                optionUserBalance.getIssuedAmount(),
                optionUserBalance.getSellingAmount()

        );
        return ResponseEntity.ok(optionUserBalanceResponse);
    }

    @GetMapping("/{optionId}/user/{address}/sell-orders")
    public ResponseEntity<List<OptionOrder>> getSellOrdersByUser(
            @PathVariable Long optionId,
            @PathVariable String address) {
          // Since we have no user address in the optionOrder Entity, we retrieve all orders and filter by the user
         // should ideally add an index in the database, or add the column to the entity
       List<OptionOrder> OptionOrders = optionOrderRepository.findAll().stream().filter(order -> order.getPosterAddress().equals(address) && order.getOptionId().equals(optionId) && order.getOrderType().equals(OptionOrderType.SELL)).collect(Collectors.toList());
        return ResponseEntity.ok(OptionOrders);
    }

    @GetMapping("/{optionId}/user/{address}/buy-orders")
    public ResponseEntity<List<OptionOrder>> getBuyOrdersByUser(
            @PathVariable Long optionId,
            @PathVariable String address) {
        // Since we have no user address in the optionOrder Entity, we retrieve all orders and filter by the user
        // should ideally add an index in the database, or add the column to the entity
        List<OptionOrder> OptionOrders = optionOrderRepository.findAll().stream().filter(order -> order.getPosterAddress().equals(address) && order.getOptionId().equals(optionId) && order.getOrderType().equals(OptionOrderType.BUY))
        .collect(Collectors.toList());
        return ResponseEntity.ok(OptionOrders);
    }


    // Get all option events related to an option by an user
    @GetMapping("/{optionId}/user/{address}/option-events")
    public ResponseEntity<List<OptionEvent>> getOptionEventsByUser(
            @PathVariable Long optionId,
            @PathVariable String address) {
        List<OptionEvent> optionEvents = optionEventRepository.findByOptionIdAndAddress(optionId, address);
        return ResponseEntity.ok(optionEvents);
    }

    // Get all trade events related to an option by an user
    @GetMapping("/{optionId}/user/{address}/trade-events")
    public ResponseEntity<List<OptionOrderEvent>> getOptionTradeEventsByUser(
            @PathVariable Long optionId,
            @PathVariable String address) {
        List<OptionOrderEvent> optionOrderEvents = optionOrderEventRepository.findByOptionIdAndPosterAddress(optionId, address);
        return ResponseEntity.ok(optionOrderEvents);
    }
}


@Getter
@Setter
@AllArgsConstructor
class TopOrdersResponse {
    List<OptionOrder> buyOrders;
    List<OptionOrder> sellOrders;
}

@Getter
@Setter
@AllArgsConstructor
class OptionUserBalanceResponse {
    Long ownedAmount;
    Long issuedAmount;
    Long sellingAmount;
}