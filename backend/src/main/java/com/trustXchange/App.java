// App.java
package com.trustXchange;

import okhttp3.HttpUrl;
import org.xrpl.xrpl4j.client.XrplClient;
import org.xrpl.xrpl4j.codec.addresses.AddressCodec;
import org.xrpl.xrpl4j.model.client.accounts.AccountTransactionsResult;
import org.xrpl.xrpl4j.model.client.accounts.AccountTransactionsTransaction;
import org.xrpl.xrpl4j.model.transactions.Address;
import org.xrpl.xrpl4j.model.transactions.Hash256;
import org.xrpl.xrpl4j.model.transactions.TransactionMetadata;
import org.xrpl.xrpl4j.model.transactions.XAddress;
import org.xrpl.xrpl4j.client.JsonRpcClientErrorException;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

public class App 
{
    public static void main(String[] args)
    {
        System.out.println("Running the Transaction History and Monitoring sample...");

        // Construct a network client
        HttpUrl rippledUrl = HttpUrl.get("https://s.devnet.rippletest.net:51234/");
        System.out.println("Connecting to XRPL at " + rippledUrl);
        XrplClient xrplClient = new XrplClient(rippledUrl);

        // Specify the address to monitor
        String classicAddressString = "rfv9EskzSdWEsZsyBrujtidD2qdgiz8v7W";
        Address classicAddress = Address.of(classicAddressString);
        XAddress xAddress = AddressCodec.getInstance().classicAddressToXAddress(classicAddress, true);
        System.out.println("Monitoring Address: " + classicAddress);
        System.out.println("X-Address: " + xAddress);

        // Optional: Fund the account using the testnet Faucet (if needed)
        /*
        FaucetClient faucetClient = FaucetClient.construct(HttpUrl.get("https://faucet.altnet.rippletest.net"));
        faucetClient.fundAccount(FundAccountRequest.of(classicAddress));
        System.out.println("Funded the account using the Testnet faucet.");
        */

        Set<Hash256> seenTransactionHashes = new HashSet<>();
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

        // Monitor New Transactions for 5 minutes
        Instant endTime = Instant.now().plus(Duration.ofMinutes(15));
        

        System.out.println("Starting to monitor new transactions for 5 minutes...");

        while (Instant.now().isBefore(endTime)) {
            try {
                AccountTransactionsResult newTransactions = xrplClient.accountTransactions(classicAddress);
                newTransactions.transactions().forEach(tx -> {
                    Hash256 txHash = tx.resultTransaction().hash();
                    if (!seenTransactionHashes.contains(txHash)) {
                        seenTransactionHashes.add(txHash);
                        System.out.printf("New Transaction: %s\n", tx.resultTransaction());
                    }
                });
            } catch (JsonRpcClientErrorException e) {
                System.out.println("Error fetching new transactions: " + e.getMessage());
            }

            // Sleep for 30 seconds before the next check
            try {
                Thread.sleep(30000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                System.out.println("Monitoring interrupted.");
                break;
            }
        }

        System.out.println("Finished monitoring transactions.");
    }
}