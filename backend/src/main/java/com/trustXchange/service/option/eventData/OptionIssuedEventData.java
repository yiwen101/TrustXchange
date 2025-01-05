// OptionIssuedEventData.java
package com.trustXchange.service.option.eventData;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OptionIssuedEventData  extends OptionEventData {
    private String sourceAddress;
    private Long strikePrice;
    private Long expiryWeeks;
    private Long amount;
    private boolean isCall;
}