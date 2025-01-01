package com.trustXchange.service.eventData;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class PriceUpdatedEventData extends  P2PEventData {
    BigDecimal newPrice;
}