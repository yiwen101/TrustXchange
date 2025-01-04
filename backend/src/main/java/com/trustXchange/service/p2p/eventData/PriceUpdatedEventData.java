package com.trustXchange.service.p2p.eventData;

import java.math.BigInteger;

import lombok.Value;

@Value
public class PriceUpdatedEventData  extends  P2PEventData {
    BigInteger newPrice;
}