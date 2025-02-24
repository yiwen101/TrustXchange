package com.trustXchange.gateway.evm;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

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
            // wait for 3 seconds before second call, as sometime gateway will block the second call even though first is approved
            service.approveContractCall(input)
                    .thenCompose(receipt -> sleep(3).thenApply(v -> receipt))
                    .thenCompose(receipt -> {
                        info.setIsApproved(true);
                        info.setGatewayTransactionHash(receipt.getTransactionReceipt().get().getTransactionHash());
                        gmpInfoRepository.save(info);
                        return CompletableFuture.completedFuture(receipt);
                    })
                    .thenCompose(receipt -> service.callContract(executeParams, destinationAddress))
                    .thenAccept(receipt -> {
                        System.out.println("callContract Transaction Receipt: " + receipt.getTransactionReceipt().get());
                        info.setIsCalled(true);
                        info.setContractTransactionHash(receipt.getTransactionReceipt().get().getTransactionHash());
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
                    .thenCompose(receipt -> sleep(3).thenApply(v -> receipt))
                    .thenCompose(receipt -> {
                        info.setIsApproved(true);
                        info.setGatewayTransactionHash(receipt.getTransactionReceipt().get().getTransactionHash());
                        gmpInfoRepository.save(info);
                        return CompletableFuture.completedFuture(receipt);
                    })
                    .thenCompose(receipt -> service.callContractWithMint(executeWithTokenParams, destinationAddress))
                    .thenAccept(receipt -> {
                        System.out.println("callContractWithMint Transaction Receipt: " + receipt.getTransactionReceipt().get());
                        info.setIsCalled(true);
                        info.setContractTransactionHash(receipt.getTransactionReceipt().get().getTransactionHash());
                        gmpInfoRepository.save(info);
                    })
                    .exceptionally(e -> {
                        System.err.println("Error during contract calls: " + e.getMessage());
                        return null;
                    });
        }
    }

    private CompletableFuture<Void> sleep(int seconds) {
        return CompletableFuture.runAsync(() -> {
            for (int i = 0; i < seconds; i++) {
                try {
                    System.out.println("Sleeping for " + (seconds - i) + " seconds");
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
    }
    
}
