package com.trustXchange.DTO.P2P;

import lombok.Value;
import org.web3j.abi.datatypes.generated.Uint256;


@Value
public class LoanRepaidDTO extends  P2PEventData {
    Uint256 loanId;
    Uint256 amountRepaid;
    Uint256 totalPaid;
}