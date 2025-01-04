// OptionOrderPlacedEventData.java
package com.trustXchange.service.option.eventData;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptionOrderPlacedEventData  extends OptionEventData {
   private Long orderId;
    private String posterAddress;
    private Long strikePrice;
    private Long expiryWeeks;
    private Long price;
    private Long amount;
    private int orderType;
}