package com.trustXchange.DTO.P2P;

import lombok.Value;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Utf8String;

@Value
public class BorrowingRequestCreatedDTO extends P2PEventData {
    Uint256 requestId;
    Utf8String borrower;
    Uint256 amountToBorrowUSD;
    Uint256 collateralAmountXRP;
    Uint256 maxCollateralRatio;
    Uint256 liquidationThreshold;
    Uint256 desiredInterestRate;
    Uint256 paymentDuration;
    Uint256 minimalPartialFill;
}