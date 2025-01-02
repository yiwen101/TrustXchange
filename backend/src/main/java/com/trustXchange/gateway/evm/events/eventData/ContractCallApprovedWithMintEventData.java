package com.trustXchange.gateway.evm.events.eventData;

import java.math.BigInteger;

import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.generated.Bytes32;

import lombok.Value;

@Value
public class ContractCallApprovedWithMintEventData extends  GatewayEventData {
    Bytes32 commandId;
    String sourceChain;
    String sourceAddress;
    Address contractAddress;
    Bytes32 payloadHash;
    String symbol;
    BigInteger amount;
    Bytes32 sourceTxHash;
    BigInteger sourceEventIndex;
}