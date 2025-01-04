package com.trustXchange.gateway.evm.events;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Optional;

import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;

/*
 * 
    event TokenSent(
        address indexed sender,
        string destinationChain,
        string destinationAddress,
        string symbol,
        uint256 amount
    );

    event ContractCallApproved(
        bytes32 indexed commandId,
        string sourceChain,
        string sourceAddress,
        address indexed contractAddress,
        bytes32 indexed payloadHash,
        bytes32 sourceTxHash,
        uint256 sourceEventIndex
    );

    event ContractCallApprovedWithMint(
        bytes32 indexed commandId,
        string sourceChain,
        string sourceAddress,
        address indexed contractAddress,
        bytes32 indexed payloadHash,
        string symbol,
        uint256 amount,
        bytes32 sourceTxHash,
        uint256 sourceEventIndex
    );
 */
public class GatewayEvents {
    public static final Event TOKEN_SENT_EVENT = new Event(
        "TokenSent",
        Arrays.asList(
            new TypeReference<Address>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event CONTRACT_CALL_APPROVED_EVENT = new Event(
        "ContractCallApproved",
        // ignore  bytes32 sourceTxHash, uint256 sourceEventIndex
        Arrays.asList(
            new TypeReference<Bytes32>(true) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Bytes32>(true) {}
        )
    );

    public static final Event  CONTRACT_CALL_APPROVED_WITH_MINT_EVENT  = new Event(
        "ContractCallApprovedWithMint",
        Arrays.asList(
            new TypeReference<Bytes32>(true) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Address>(true) {},
            new TypeReference<Bytes32>(true) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );


    public static final List<Event> ALL_EVENTS = Arrays.<Event>asList(
        TOKEN_SENT_EVENT,
        CONTRACT_CALL_APPROVED_EVENT,
        CONTRACT_CALL_APPROVED_WITH_MINT_EVENT       
    );
        
    private static Map<String, Event> EVENT_MAP = new HashMap<String, Event>(
        ALL_EVENTS.stream().collect(Collectors.toMap(EventEncoder::encode, event -> event))
    );
    
    public static Optional<Event> getEventWithHash(String eventHash) {
        return Optional.ofNullable(EVENT_MAP.get(eventHash));
    }
}