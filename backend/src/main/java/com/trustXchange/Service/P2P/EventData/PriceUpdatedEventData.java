package com.trustXchange.Service.P2P.EventData;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class PriceUpdatedEventData extends  P2PEventData {
    BigDecimal newPrice;
}