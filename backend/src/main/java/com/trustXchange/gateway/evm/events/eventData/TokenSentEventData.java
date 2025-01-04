package com.trustXchange.gateway.evm.events.eventData;

import java.math.BigInteger;

import org.web3j.abi.datatypes.Address;

import lombok.Value;


@Value
public class TokenSentEventData extends  GatewayEventData {
    Address sender;
    String destinationChain;
    String destinationAddress;
    String symbol;
    BigInteger amount;
}