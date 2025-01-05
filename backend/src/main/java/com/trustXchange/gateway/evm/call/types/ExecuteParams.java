package com.trustXchange.gateway.evm.call.types;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteParams {
    String commandId;
    String sourceChain;
    String sourceAddress;
    String payload;
}
