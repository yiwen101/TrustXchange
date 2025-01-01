package com.trustXchange.DTO.P2P;

import lombok.Value;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.Utf8String;


@Value
public class LoanLiquidatedDTO extends  P2PEventData {
    Uint256 loanId;
    Utf8String liquidator;
    Uint256 collateralLiquidated;
}