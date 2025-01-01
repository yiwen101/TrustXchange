package com.trustXchange.EventData.P2P;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class PriceUpdatedEventData extends  P2PEventData {
    BigDecimal newPrice;
}