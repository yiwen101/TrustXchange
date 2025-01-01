package com.trustXchange.DTO.P2P;

import java.math.BigDecimal;

import lombok.Value;


@Value
public class PriceUpdatedDTO extends  P2PEventData {
    BigDecimal newPrice;
}