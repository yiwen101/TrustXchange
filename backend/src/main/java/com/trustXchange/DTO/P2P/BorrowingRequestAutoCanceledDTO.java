package com.trustXchange.DTO.P2P;

import lombok.Value;
import org.web3j.abi.datatypes.generated.Uint256;


@Value
public class BorrowingRequestAutoCanceledDTO extends  P2PEventData {
    Uint256 requestId;
}