package com.trustXchange.gateway.evm;

import java.math.BigDecimal;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.xrpl.xrpl4j.model.transactions.CurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.IssuedCurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.XrpCurrencyAmount;

import com.trustXchange.gateway.evm.call.ContractService;
import com.trustXchange.gateway.evm.call.GmpUtil;
import com.trustXchange.gateway.evm.call.types.GmpInputs;
import com.trustXchange.gateway.evm.call.types.GmpWithTokenInputs;
import com.trustXchange.gateway.xrpl.GMPCallInfo;

@Component
public class GmpManager {
    @Autowired
    ContractService service;
    public void manage(GMPCallInfo info) {
        CurrencyAmount currencyAmount = info.amount;
        String symbol;
        Long amount;
        if (XrpCurrencyAmount.class.isAssignableFrom(currencyAmount.getClass())) {
            XrpCurrencyAmount xrpAmount = (XrpCurrencyAmount) currencyAmount;
            symbol = "XRP";
            amount = xrpAmount.toXrp().longValue();
        } else if (IssuedCurrencyAmount.class.isAssignableFrom(currencyAmount.getClass())) {
            IssuedCurrencyAmount issuedAmount = (IssuedCurrencyAmount) currencyAmount;
            if (!"rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV".equals(issuedAmount.issuer().value())) {
                throw new IllegalArgumentException("Unsupported issuer: " + issuedAmount.issuer().value());
            }
            symbol = "USD";
            String decimalValueString = issuedAmount.value();
            BigDecimal decimalValue = new BigDecimal(decimalValueString);
            amount = decimalValue.longValue();
        } else {
            throw new IllegalArgumentException("Unsupported currency amount type: " + currencyAmount.getClass());
        }

        if (amount == 0) {
            GmpInputs inputs = GmpUtil.getGmpInputs("XRPL_testnet",info.from.toString(), info.destinationAddress, info.payload);
            service.approveContractCall(inputs.getInputData())
                    .thenCompose(receipt -> service.callContract(inputs.getExecuteParams(), info.destinationAddress))
                    .thenAccept(receipt -> {
                        System.out.println("callContract Transaction Receipt: " + receipt.getTransactionReceipt().get());
                    })
                    .exceptionally(e -> {
                        System.err.println("Error during contract calls: " + e.getMessage());
                        return null;
                    });
        } else {
            GmpWithTokenInputs inputs = GmpUtil.getGMPWithTokenInputs(info.from.toString(), info.destinationAddress, info.payload, symbol, amount);
            service.approveContractCall(inputs.getInputData())
                    .thenCompose(receipt -> service.callContractWithMint(inputs.getExecuteWithTokenParams(), info.destinationAddress))
                    .thenAccept(receipt -> {
                        System.out.println("callContractWithMint Transaction Receipt: " + receipt.getTransactionReceipt().get());
                    })
                    .exceptionally(e -> {
                        System.err.println("Error during contract calls: " + e.getMessage());
                        return null;
                    });
        }
    }
    
}
