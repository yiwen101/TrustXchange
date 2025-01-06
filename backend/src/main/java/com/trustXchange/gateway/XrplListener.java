package com.trustXchange.gateway;

import okhttp3.HttpUrl;
import org.xrpl.xrpl4j.client.XrplClient;
import org.xrpl.xrpl4j.codec.addresses.AddressCodec;
import org.xrpl.xrpl4j.model.client.accounts.AccountTransactionsResult;
import org.xrpl.xrpl4j.model.client.accounts.AccountTransactionsTransaction;
import org.xrpl.xrpl4j.model.transactions.Address;
import org.xrpl.xrpl4j.model.transactions.CurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.Hash256;
import org.xrpl.xrpl4j.model.transactions.Memo;
import org.xrpl.xrpl4j.model.transactions.MemoWrapper;
import org.xrpl.xrpl4j.model.transactions.Payment;
import org.xrpl.xrpl4j.model.transactions.Transaction;
import org.xrpl.xrpl4j.model.transactions.TransactionMetadata;
import org.xrpl.xrpl4j.model.transactions.TransactionType;
import org.xrpl.xrpl4j.model.transactions.XAddress;

import com.trustXchange.DestinationChainNotSupportException;
import com.trustXchange.entities.gmp.GmpInfo;
import com.trustXchange.gateway.xrpl.GMPCallInfo;
import com.trustXchange.repository.gmp.GmpInfoRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.xrpl.xrpl4j.client.JsonRpcClientErrorException;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Component
public class XrplListener {
    private static final Logger logger = LoggerFactory.getLogger(XrplListener.class);
    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
    @Autowired
    GmpInfoRepository gmpInfoRepository;

    Set<Hash256> seenTransactionHashes = new HashSet<>();
    XrplClient xrplClient;
    Address classicAddress;
    String XRPL_CHAIN_ADDRESS = "rfv9EskzSdWEsZsyBrujtidD2qdgiz8v7W";
    private boolean isInited = false;
    private void init() {
        if (isInited) {
            return;
        }
        isInited = true;
        HttpUrl rippledUrl = HttpUrl.get("https://s.altnet.rippletest.net:51234/");
        System.out.println("Connecting to XRPL at " + rippledUrl);
        xrplClient = new XrplClient(rippledUrl);

        classicAddress = Address.of(XRPL_CHAIN_ADDRESS);


        try {
            AccountTransactionsResult transactionsResult = xrplClient.accountTransactions(classicAddress);
            System.out.println("Past Transaction History for Address: " + classicAddress);
            transactionsResult.transactions().forEach(tx -> {
                boolean isValidated = tx.validated();
                AccountTransactionsTransaction<?> transaction = tx.resultTransaction();
                Optional<TransactionMetadata> metadata = tx.metadata();
                System.out.printf("Transaction: %s Validated: %s Metadata: %s\n", transaction, isValidated, metadata);
                if (isValidated) {
                    seenTransactionHashes.add(transaction.hash());
                }
            });
        } catch (JsonRpcClientErrorException e) {
            System.out.println("Error fetching transaction history: " + e.getMessage());
        }
        
    }
    public void listenAndManage() {
        init(); 
        // Optional: Fund the account using the testnet Faucet (if needed)
        /*
        FaucetClient faucetClient = FaucetClient.construct(HttpUrl.get("https://faucet.altnet.rippletest.net"));
        faucetClient.fundAccount(FundAccountRequest.of(classicAddress));
        System.out.println("Funded the account using the Testnet faucet.");
        */
        logger.info("Listening for new transactions");
        try {
            AccountTransactionsResult newTransactions = xrplClient.accountTransactions(classicAddress);
            newTransactions.transactions().forEach(tx -> {
            if(tx.validated() && !seenTransactionHashes.contains(tx.resultTransaction().hash())) {
                Hash256 txHash = tx.resultTransaction().hash();
                Transaction transaction = tx.resultTransaction().transaction();
                logger.info("New Transaction: " + txHash);
                seenTransactionHashes.add(txHash);
                if(transaction.transactionType().equals(TransactionType.PAYMENT)) {
                    Payment payment = (Payment) transaction;
                    try {
                        logger.info("line 101 at listener");
                        Optional<GMPCallInfo> gmpCallInfo = GMPCallInfo.Of(payment);
                        if (gmpCallInfo.isPresent()) {
                            GMPCallInfo info = gmpCallInfo.get();
                            GmpInfo gmpInfo = new GmpInfo(txHash.value(), info);
                            gmpInfoRepository.save(gmpInfo);
                            logger.info("New GMP Call: " + gmpInfo);
                        }
                    } catch (DestinationChainNotSupportException e) {
                        System.out.println("Destination chain not supported");
                        return;
                    }
                } else {
                    System.out.printf("New Transaction of type %s\n", tx.resultTransaction().transaction().transactionType());
                }
            }
            });
        } catch (JsonRpcClientErrorException e) {
            System.out.println("Error fetching new transactions: " + e.getMessage());
        }
    }
     @PreDestroy
    public void stopPrinter() {
        executorService.shutdown();
        logger.info("EventListener stopped");
    }

    @PostConstruct
    public void listenForXrplActivity() {
        executorService.scheduleAtFixedRate(this::listenAndManage, 2, 5, java.util.concurrent.TimeUnit.SECONDS);
    }
}
