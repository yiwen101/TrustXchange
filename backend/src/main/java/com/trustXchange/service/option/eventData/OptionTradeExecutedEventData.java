// OptionTradeExecutedEventData.java
package com.trustXchange.service.option.eventData;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptionTradeExecutedEventData  extends OptionEventData {
    private String buyerAddress;
    private String sellerAddress;
    private Long optionId;
    private Long strikePrice;
    private Long expiryWeeks;
    private Long price;
    private Long amount;
    private Long buyOrderId;
    private Long sellOrderId;
}