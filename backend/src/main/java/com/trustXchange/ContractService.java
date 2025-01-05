// ContractService.java
package com.trustXchange;

import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.Hash;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;

public class ContractService {

    private Web3j web3j;
    private Credentials credentials;
    private TransactionManager transactionManager;
    private BigInteger chainId;

    // Constructor to initialize Web3j and Credentials
    public ContractService() {
        String rpcUrl = "https://rpc-evm-sidechain.xrpl.org";
        web3j = Web3j.build(new HttpService(rpcUrl));

        String privateKey = "7efa80acccbdc1333081b8959f86c414abeaf3b3ba113a4a5830e62e4a1c5d14";
        credentials = Credentials.create(privateKey);

        transactionManager = new RawTransactionManager(web3j, credentials);
        try {
            EthChainId ethChainId = web3j.ethChainId().send();
            if (ethChainId.hasError()) {
                throw new RuntimeException("Error fetching chain ID: " + ethChainId.getError().getMessage());
            }
            chainId = ethChainId.getChainId();
            System.out.println("Connected to Chain ID: " + chainId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve Chain ID", e);
        }
    }

    // Function to call the execute method on the gateway contract
    public void approveContractCallWithMint(String input) {
        String gatewayAbi = "[\"function execute(bytes calldata input) external\"]";
        String gatewayAddress = "0x31126a0BCf78cF10c8dC4381BF8A48a710df5978";

        Function function = new Function(
                "execute",
                Collections.singletonList(new DynamicBytes(Numeric.hexStringToByteArray(input))),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);
        sendTransaction(gatewayAddress, encodedFunction);
    }

    // Function to call the POC contract
    public void callPocContract(GmpUtil.GMPInputs params) {
        String gmsExecutableAddress = System.getenv("GMS_EXECUTABLE_ADDRESS");
        callContract(params, gmsExecutableAddress);
    }

    // Function to call the P2P contract
    public void callP2PContract(GmpUtil.GMPInputs params) {
        String p2pAddress = System.getenv("XRP_LENDING_P2P");
        System.out.println("Calling P2P Contract with address: " + p2pAddress);
        callContract(params, p2pAddress);
    }

    // Function to call the Pool contract
    public void callPoolContract(GmpUtil.GMPInputs params) {
        String poolAddress = System.getenv("XRP_LENDING_POOL");
        System.out.println("Calling Pool Contract with address: " + poolAddress);
        callContract(params, poolAddress);
    }

    // Function to call the Option contract
    public void callOptionContract(GmpUtil.GMPInputs params) {
        String optionAddress = System.getenv("OPTION_TRADING");
        System.out.println("Calling Option Contract with address: " + optionAddress);
        callContract(params, optionAddress);
    }

    // Generic function to call executeWithToken on a contract
    private void callContract(GmpUtil.GMPInputs params, String contractAddress) {
        String gmsExecutableAbi = "["
                + "\"error DecodingError(string reason)\","
                + "\"error AmountCheckFailed(uint256 amount)\","
                + "\"error SendTokenFailed(string reason)\","
                + "\"function executeWithToken(bytes32 commandId,string calldata sourceChain,string calldata sourceAddress,bytes calldata payload,string calldata tokenSymbol,uint256 amount) external\""
                + "]";

        Function function = new Function(
                "executeWithToken",
                Arrays.asList(
                        new Bytes32(Numeric.hexStringToByteArray(params.getExecuteWithTokenParams().getCommandId())),
                        new Utf8String(params.getExecuteWithTokenParams().getSourceChain()),
                        new Utf8String(params.getExecuteWithTokenParams().getSourceAddress()),
                        new DynamicBytes(Numeric.hexStringToByteArray(params.getExecuteWithTokenParams().getPayload())),
                        new Utf8String(params.getExecuteWithTokenParams().getTokenSymbol()),
                        new Uint(BigInteger.valueOf(params.getExecuteWithTokenParams().getAmount()))
                ),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);
        sendTransaction(contractAddress, encodedFunction);
    }

    // Helper method to send transactions
    private void sendTransaction(String contractAddress, String encodedFunction) {
        try {
            EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                    credentials.getAddress(), DefaultBlockParameterName.LATEST).send();

            BigInteger nonce = ethGetTransactionCount.getTransactionCount();
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            BigInteger gasLimit = BigInteger.valueOf(300000); // Adjust as needed

            RawTransaction rawTransaction = RawTransaction.createTransaction(
                    nonce,
                    gasPrice,
                    gasLimit,
                    contractAddress,
                    encodedFunction
            );

            byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, chainId.longValue(),credentials);
            String hexValue = Numeric.toHexString(signedMessage);

            EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();

            if (ethSendTransaction.hasError()) {
                System.err.println("Transaction Error: " + ethSendTransaction.getError().getMessage());
                return;
            }

            String transactionHash = ethSendTransaction.getTransactionHash();
            System.out.println("Transaction Hash: " + transactionHash);

            // Wait for the transaction receipt
            EthGetTransactionReceipt transactionReceipt = null;
            while (transactionReceipt == null || !transactionReceipt.getTransactionReceipt().isPresent()) {
                Thread.sleep(1000);
                transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
            }

            System.out.println("Transaction Receipt: " + transactionReceipt.getTransactionReceipt().get());

        } catch (Exception e) {
            System.err.println("Error sending transaction: " + e.getMessage());
        }
    }
}