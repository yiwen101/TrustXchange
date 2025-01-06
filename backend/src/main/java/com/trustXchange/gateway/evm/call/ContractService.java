// ContractService.java
package com.trustXchange.gateway.evm.call;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Numeric;

import com.trustXchange.gateway.evm.call.types.ContractAddress;
import com.trustXchange.gateway.evm.call.types.ExecuteParams;
import com.trustXchange.gateway.evm.call.types.ExecuteWithTokenParams;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.PostConstruct;

@Component
public class ContractService {
   
    private Credentials credentials;
    private BigInteger chainId;

    // ThreadLocal Web3j instances
    private static final ThreadLocal<Web3j> web3jThreadLocal = ThreadLocal.withInitial(() -> {
        Web3j w3j = Web3j.build(new HttpService("https://rpc-evm-sidechain.xrpl.org"));
        try {
            EthChainId ethChainId = w3j.ethChainId().send();
            if (ethChainId.hasError()) {
                throw new RuntimeException("Error fetching chain ID: " + ethChainId.getError().getMessage());
            }
            BigInteger cid = ethChainId.getChainId();
            System.out.println("Connected to Chain ID: " + cid + " on Thread: " + Thread.currentThread().getName());
            return w3j;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve Chain ID", e);
        }
    });

    // ExecutorService for asynchronous tasks
    private static final ExecutorService executorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());

    // Constructor to initialize Credentials
    public ContractService(@Value("${application.privateKey}") String privateKey) {
        credentials = Credentials.create(privateKey);

        // Initialize chainId using the ThreadLocal Web3j
        try {
            // Using the ThreadLocal Web3j instance to get chainId
            EthChainId ethChainId = web3jThreadLocal.get().ethChainId().send();
            if (ethChainId.hasError()) {
                throw new RuntimeException("Error fetching chain ID: " + ethChainId.getError().getMessage());
            }
            chainId = ethChainId.getChainId();
            System.out.println("Chain ID initialized: " + chainId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve Chain ID during initialization", e);
        }
    }

    // Function to call the execute method on the gateway contract
    public CompletableFuture<EthGetTransactionReceipt> approveContractCall(String input) {
        Function function = new Function(
                "execute",
                Collections.singletonList(new DynamicBytes(Numeric.hexStringToByteArray(input))),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);
        return sendTransactionAsync(ContractAddress.MY_GATEWAY_ADDRESS, encodedFunction);
    }

    // Generic function to call executeWithToken on a contract
    public CompletableFuture<EthGetTransactionReceipt> callContractWithMint(ExecuteWithTokenParams params, String contractAddress) {
        Function function = new Function(
                "executeWithToken",
                Arrays.asList(
                        new Bytes32(Numeric.hexStringToByteArray(params.getCommandId())),
                        new Utf8String(params.getSourceChain()),
                        new Utf8String(params.getSourceAddress()),
                        new DynamicBytes(Numeric.hexStringToByteArray(params.getPayload())),
                        new Utf8String(params.getTokenSymbol()),
                        new Uint(BigInteger.valueOf(params.getAmount()))
                ),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);
        return sendTransactionAsync("0x" + contractAddress, encodedFunction);
    }

    // Function to call the execute method with ExecuteParams
    public CompletableFuture<EthGetTransactionReceipt> callContract(ExecuteParams param, String contractAddress) {
        Function function = new Function(
                "execute",
                Arrays.asList(
                        new Utf8String(param.getCommandId()),
                        new Utf8String(param.getSourceChain()),
                        new Utf8String(param.getSourceAddress()),
                        new DynamicBytes(Numeric.hexStringToByteArray(param.getPayload()))
                ),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);
        return sendTransactionAsync("0x" + contractAddress, encodedFunction);
    }

    // Asynchronous Helper method to send transactions
    private CompletableFuture<EthGetTransactionReceipt> sendTransactionAsync(String contractAddress, String encodedFunction) {
        try {
            Web3j web3j = web3jThreadLocal.get();

            // Fetch the latest nonce asynchronously
            CompletableFuture<BigInteger> nonceFuture = web3j.ethGetTransactionCount(
                    credentials.getAddress(), DefaultBlockParameterName.LATEST)
                    .sendAsync()
                    .thenApply(EthGetTransactionCount::getTransactionCount);

            // Fetch the current gas price asynchronously
            CompletableFuture<BigInteger> gasPriceFuture = web3j.ethGasPrice()
                    .sendAsync()
                    .thenApply(EthGasPrice::getGasPrice);

            // Combine nonce and gas price to create the raw transaction
            CompletableFuture<String> signedTxHexFuture = nonceFuture.thenCombine(gasPriceFuture, (nonce, gasPrice) -> {
                BigInteger gasLimit = BigInteger.valueOf(300000); // Adjust as needed

                RawTransaction rawTransaction = RawTransaction.createTransaction(
                        nonce,
                        gasPrice,
                        gasLimit,
                        contractAddress,
                        encodedFunction
                );

                byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, chainId.longValue(), credentials);
                return Numeric.toHexString(signedMessage);
            });

            // Send the signed transaction asynchronously
            CompletableFuture<EthSendTransaction> ethSendTxFuture = signedTxHexFuture.thenCompose(signedTxHex ->
                    web3j.ethSendRawTransaction(signedTxHex).sendAsync()
            );

            // Handle the transaction and poll for receipt
            return ethSendTxFuture.thenCompose(ethSendTransaction -> {
                if (ethSendTransaction.hasError()) {
                    CompletableFuture<EthGetTransactionReceipt> failedFuture = new CompletableFuture<>();
                    failedFuture.completeExceptionally(new RuntimeException("Transaction Error: " + ethSendTransaction.getError().getMessage()));
                    return failedFuture;
                }
                String transactionHash = ethSendTransaction.getTransactionHash();
                System.out.println("Transaction Hash: " + transactionHash + " on Thread: " + Thread.currentThread().getName());
                return pollForReceipt(transactionHash);
            });

        } catch (Exception e) {
            CompletableFuture<EthGetTransactionReceipt> failedFuture = new CompletableFuture<>();
            failedFuture.completeExceptionally(e);
            return failedFuture;
        }
    }

    // Helper method to poll for transaction receipt asynchronously
    private CompletableFuture<EthGetTransactionReceipt> pollForReceipt(String transactionHash) {
        CompletableFuture<EthGetTransactionReceipt> receiptFuture = new CompletableFuture<>();
        pollReceipt(transactionHash, receiptFuture);
        return receiptFuture;
    }

    private void pollReceipt(String transactionHash, CompletableFuture<EthGetTransactionReceipt> receiptFuture) {
        Web3j web3j = web3jThreadLocal.get();
        web3j.ethGetTransactionReceipt(transactionHash).sendAsync()
                .thenAccept(receipt -> {
                    if (receipt.getTransactionReceipt().isPresent()) {
                        receiptFuture.complete(receipt);
                    } else {
                        // Schedule the next poll after 1 second without blocking
                        executorService.submit(() -> {
                            try {
                                Thread.sleep(1000);
                                pollReceipt(transactionHash, receiptFuture);
                            } catch (InterruptedException e) {
                                receiptFuture.completeExceptionally(e);
                            }
                        });
                    }
                })
                .exceptionally(e -> {
                    receiptFuture.completeExceptionally(e);
                    return null;
                });
    }

    // Shutdown method to properly close Web3j instances and executor service
    public static void shutdown() {
        executorService.shutdown();
        web3jThreadLocal.get().shutdown();
    }
}