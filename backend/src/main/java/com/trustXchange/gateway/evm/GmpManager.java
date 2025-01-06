package com.trustXchange.gateway.evm;

import java.math.BigDecimal;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.xrpl.xrpl4j.model.transactions.CurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.IssuedCurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.XrpCurrencyAmount;

import com.trustXchange.entities.gmp.GmpInfo;
import com.trustXchange.gateway.evm.call.ContractService;
import com.trustXchange.gateway.evm.call.GmpUtil;
import com.trustXchange.gateway.evm.call.types.ExecuteParams;
import com.trustXchange.gateway.evm.call.types.ExecuteWithTokenParams;
import com.trustXchange.gateway.evm.call.types.GmpInputs;
import com.trustXchange.gateway.evm.call.types.GmpWithTokenInputs;
import com.trustXchange.repository.gmp.GmpInfoRepository;

@Component
public class GmpManager {
    @Autowired
    ContractService service;
    @Autowired
    private  GmpInfoRepository gmpInfoRepository;
    @Autowired
    private GmpUtil GmpUtil;
    public void manage(GmpInfo info, String payloadStr) {
        Long amount = info.getAmount();
        String symbol = info.getSymbol();
        String destinationAddress = info.getDestinationAddress();
        String from = info.getFrom();
        String sourceChain = "XRPL_testnet";
        String payloadHash = info.getPayloadHash();
        if (amount == 0) {
            GmpInputs inputs = GmpUtil.getGmpInputs(sourceChain, from, destinationAddress, payloadStr,payloadHash);
            String input = inputs.getInputData();
            ExecuteParams executeParams = inputs.getExecuteParams();
            service.approveContractCall(input)
                    .thenCompose(receipt -> service.callContract(executeParams, destinationAddress))
                    .thenAccept(receipt -> {
                        System.out.println("callContract Transaction Receipt: " + receipt.getTransactionReceipt().get());
                        info.setIsProcessed(true);
                        gmpInfoRepository.save(info);
                    })
                    .exceptionally(e -> {
                        System.err.println("Error during contract calls: " + e.getMessage());
                        return null;
                    });
        } else {
            GmpWithTokenInputs inputs = GmpUtil.getGMPWithTokenInputs(sourceChain, from, destinationAddress, payloadStr,symbol,amount);
            String input = inputs.getInputData();
            ExecuteWithTokenParams executeWithTokenParams = inputs.getExecuteWithTokenParams();
            service.approveContractCall(input)
                    .thenCompose(receipt -> service.callContractWithMint(executeWithTokenParams, destinationAddress))
                    .thenAccept(receipt -> {
                        System.out.println("callContractWithMint Transaction Receipt: " + receipt.getTransactionReceipt().get());
                        info.setIsProcessed(true);
                        gmpInfoRepository.save(info);
                    })
                    .exceptionally(e -> {
                        System.err.println("Error during contract calls: " + e.getMessage());
                        return null;
                    });
        }
    }
    
}
