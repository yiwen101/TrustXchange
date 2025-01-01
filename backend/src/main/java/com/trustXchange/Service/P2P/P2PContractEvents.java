package com.trustXchange.Service.P2P;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Optional;

import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;

public class P2PContractEvents {
    public static final Event LOAN_CREATED_EVENT = new Event(
        "LoanCreated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event LOAN_UPDATED_EVENT = new Event(
        "LoanUpdated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event LOAN_REPAID_EVENT = new Event(
        "LoanRepaid",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event LOAN_LIQUIDATED_EVENT = new Event(
        "LoanLiquidated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event PRICE_UPDATED_EVENT = new Event(
        "PriceUpdated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event LENDING_REQUEST_CREATED_EVENT = new Event(
        "LendingRequestCreated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event BORROWING_REQUEST_CREATED_EVENT = new Event(
        "BorrowingRequestCreated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event LENDING_REQUEST_CANCELED_EVENT = new Event(
        "LendingRequestCanceled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {}
        )
    );

    public static final Event BORROWING_REQUEST_CANCELED_EVENT = new Event(
        "BorrowingRequestCanceled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {}
        )
    );

    public static final Event LENDING_REQUEST_AUTO_CANCELED_EVENT = new Event(
        "LendingRequestAutoCanceled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event BORROWING_REQUEST_AUTO_CANCELED_EVENT = new Event(
        "BorrowingRequestAutoCanceled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event LENDING_REQUEST_FILLED_EVENT = new Event(
        "LendingRequestFilled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    public static final Event BORROWING_REQUEST_FILLED_EVENT = new Event(
        "BorrowingRequestFilled",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    

    public static final List<Event> ALL_EVENTS = Arrays.<Event>asList(
        LOAN_CREATED_EVENT,
        LOAN_UPDATED_EVENT,
        LOAN_REPAID_EVENT,
        LOAN_LIQUIDATED_EVENT,
        PRICE_UPDATED_EVENT,
        LENDING_REQUEST_CREATED_EVENT,
        BORROWING_REQUEST_CREATED_EVENT,
        LENDING_REQUEST_CANCELED_EVENT,
        BORROWING_REQUEST_CANCELED_EVENT,
        LENDING_REQUEST_AUTO_CANCELED_EVENT,
        BORROWING_REQUEST_AUTO_CANCELED_EVENT,
        LENDING_REQUEST_FILLED_EVENT,
        BORROWING_REQUEST_FILLED_EVENT
    );
        
    private static Map<String, Event> EVENT_MAP = new HashMap<String, Event>(
        ALL_EVENTS.stream().collect(Collectors.toMap(EventEncoder::encode, event -> event))
    );
    
    public static Optional<Event> getEventWithHash(String eventHash) {
        return Optional.ofNullable(EVENT_MAP.get(eventHash));
    }
}