package com.trustXchange.DTO.P2P;

import lombok.Value;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Utf8String;

@Value
public class LendingRequestCanceledDTO extends  P2PEventData {
    Uint256 requestId;
    Utf8String canceller;
}