package com.trustXchange;
// GmpUtil.java
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

public class GmpUtil {

    public static final String keccak256(String input) {
        return Numeric.toHexString(Hash.sha3(input.getBytes(StandardCharsets.UTF_8)));
    }

    // Constants
    public static final String SELECTOR_APPROVE_CONTRACT_CALL = keccak256("approveContractCall(bytes,bytes32)");
    public static final String SELECTOR_APPROVE_CONTRACT_CALL_WITH_MINT = keccak256("approveContractCallWithMint(bytes,bytes32,string,uint256)");

    // Load environment variables
    private static final String GMS_EXECUTABLE_ADDRESS = "0x08dBB609c00493Db4209Cb26ccDcF4a1245D8595";

    public static String prepareCommandData(BigInteger chainId, List<byte[]> commandIds, List<String> commands, List<byte[]> params) {
        List<Type> inputParameters = Arrays.asList(
                new Uint256(chainId),
                new DynamicArray<>(Bytes32.class, commandIds.stream().map(Bytes32::new).collect(Collectors.toList())),
                new DynamicArray<>(Utf8String.class, commands.stream().map(Utf8String::new).collect(Collectors.toList())),
                new DynamicArray<>(DynamicBytes.class, params.stream().map(DynamicBytes::new).collect(Collectors.toList()))
        );

        Function function = new Function(
                "",
                inputParameters,
                Collections.emptyList()
        );

        return "0x" + FunctionEncoder.encode(function).substring(10);
    }

    public static String prepareExecuteInput(String data, byte[] proof) {
        List<Type> inputParameters = Arrays.asList(
                new DynamicBytes(Numeric.hexStringToByteArray(data)),
                new DynamicBytes(proof)
        );

        Function function = new Function(
                "",
                inputParameters,
                Collections.emptyList()
        );

        return "0x" + FunctionEncoder.encode(function).substring(10);
    }

    public static String createCommandId(String commandName, String paramBytes, long nonce) {
        List<Type> inputParameters = Arrays.asList(
                new Utf8String(commandName),
                new DynamicBytes(Numeric.hexStringToByteArray(paramBytes)),
                new Uint256(BigInteger.valueOf(nonce))
        );

        Function function = new Function(
                "",
                inputParameters,
                Collections.emptyList()
        );

        String encodedData = FunctionEncoder.encode(function);
        return Numeric.toHexString(Hash.sha3(encodedData.getBytes(StandardCharsets.UTF_8)));
    }

    public static String createGatewayCallParams(String sourceChain, String sourceAddress, String contractAddress,
                                                 String payloadHash, String sourceTxHash, long sourceEventIndex) {
        List<Type> inputParameters = Arrays.asList(
                new Utf8String(sourceChain),
                new Utf8String(sourceAddress),
                new Address(contractAddress),
                new Bytes32(Numeric.hexStringToByteArray(payloadHash)),
                new Bytes32(Numeric.hexStringToByteArray(sourceTxHash)),
                new Uint256(BigInteger.valueOf(sourceEventIndex))
        );

        Function function = new Function(
                "",
                inputParameters,
                Collections.emptyList()
        );

        return "0x" + FunctionEncoder.encode(function).substring(10);
    }

    public static String createGatewayCallWithMintParams(String sourceChain, String sourceAddress, String contractAddress,
                                                         String payloadHash, String symbol, long amount,
                                                         String sourceTxHash, long sourceEventIndex) {
            System.out.println("sourceChain: " + sourceChain);
            System.out.println("sourceAddress: " + sourceAddress);
            System.out.println("contractAddress: " + contractAddress);
            System.out.println("payloadHash: " + payloadHash);
            System.out.println("symbol: " + symbol);
            System.out.println("amount: " + amount);
            System.out.println("sourceTxHash: " + sourceTxHash);
            System.out.println("sourceEventIndex: " + sourceEventIndex);
        
            List<Type> inputParameters = Arrays.asList(
                new Utf8String(sourceChain),
                new Utf8String(sourceAddress),
                new Address(contractAddress),
                new Bytes32(Numeric.hexStringToByteArray(payloadHash)),
                new Utf8String(symbol),
                new Uint256(BigInteger.valueOf(amount)),
                new Bytes32(Numeric.hexStringToByteArray(sourceTxHash)),
                new Uint256(BigInteger.valueOf(sourceEventIndex))
        );

        Function function = new Function(
                "",
                inputParameters,
                Collections.emptyList()
        );

        return "0x" + FunctionEncoder.encode(function).substring(10);
    }

    public static String createExecutePayload(String message) {
        List<Type> inputParameters = Collections.singletonList(
                new Utf8String(message)
        );

        Function function = new Function(
                "",
                inputParameters,
                Collections.emptyList()
        );
        //0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000
        //0x88eaeb6c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000
        // why is the first 0x88eaeb6c
        return "0x" + FunctionEncoder.encode(function).substring(10);
    }

    public static GMPInputs getGMPInputs(String contractAddress, String payloadBytes, String tokenSymbol, Long tokenAmount) {
        //System.out.println("payloadBytes: " + payloadBytes);

        long tokenDenom = 1;
        BigInteger chainId = BigInteger.ONE; // Example Chain ID
        // keccak256
        String payloadHash = Hash.sha3(payloadBytes);
        String sourceChain = "XRPL_testnet";
        String sourceAddress = "source chain address string";
        String sourceTxHash = Numeric.toHexString(Hash.sha3("ignored".getBytes(StandardCharsets.UTF_8)));
        long sourceEventIndex = 0;

        boolean isWithMint = tokenSymbol != null && tokenAmount != null;

        String param = isWithMint ?
                createGatewayCallWithMintParams(sourceChain, sourceAddress, contractAddress, payloadHash, tokenSymbol, tokenAmount, sourceTxHash, sourceEventIndex) :
                createGatewayCallParams(sourceChain, sourceAddress, contractAddress, payloadHash, sourceTxHash, sourceEventIndex);

        String commandName = isWithMint ? "approveContractCallWithMint" : "approveContractCall";
        String commandId = createCommandId(commandName, param, 0);
        //temp
        commandId = "0xbad8130ff1b11b183c637845870ab03fbfacde92b1ed9ae961386430bb1c01eb";
        //System.out.println("Command ID: " + commandId);
        //System.out.println("Command Name: " + commandName);
        //System.out.println("Param: " + param);
        List<String> commandIds = Collections.singletonList(commandId);
        List<String> commands = Collections.singletonList(commandName);
        List<String> params = Collections.singletonList(param);

        String data = prepareCommandData(chainId, 
                commandIds.stream().map(Numeric::hexStringToByteArray).collect(Collectors.toList()), 
                commands, 
                params.stream().map(s -> Numeric.hexStringToByteArray(s)).collect(Collectors.toList()));
        //System.out.println("Data: " + data);
        byte[] proof = "some_proof".getBytes(StandardCharsets.UTF_8);
        /* 
        for(byte b: proof) {
            System.out.print(b);
        }
        */
        String inputData = prepareExecuteInput(data, proof);

        System.out.println("Input data: " + inputData);

        //ExecuteWithTokenParams executeWithTokenParams = new ExecuteWithTokenParams(commandId, sourceChain, sourceAddress, payloadBytes, tokenSymbol, tokenAmount);
        return new GMPInputs(inputData, null);
    }

    public static GMPInputs getPocMockInputs(long mintAmount) {
        String payload = createExecutePayload("hello world");
        //byte[] payloadBytes = Numeric.hexStringToByteArray(payload);
        return getGMPInputs(GMS_EXECUTABLE_ADDRESS, payload, "USD", mintAmount);
    }

    // Helper Classes
    public static class GMPInputs {
        private String inputData;
        private ExecuteWithTokenParams executeWithTokenParams;

        public GMPInputs(String inputData, ExecuteWithTokenParams executeWithTokenParams) {
            this.inputData = inputData;
            this.executeWithTokenParams = executeWithTokenParams;
        }

        public String getInputData() {
            return inputData;
        }

        public ExecuteWithTokenParams getExecuteWithTokenParams() {
            return executeWithTokenParams;
        }
    }

    public static class ExecuteWithTokenParams {
        private String commandId;
        private String sourceChain;
        private String sourceAddress;
        private String payload;
        private String tokenSymbol;
        private Long amount;

        public ExecuteWithTokenParams(String commandId, String sourceChain, String sourceAddress, String payload, String tokenSymbol, Long amount) {
            this.commandId = commandId;
            this.sourceChain = sourceChain;
            this.sourceAddress = sourceAddress;
            this.payload = payload;
            this.tokenSymbol = tokenSymbol;
            this.amount = amount;
        }

        public String getCommandId() {
            return commandId;
        }

        public String getSourceChain() {
            return sourceChain;
        }

        public String getSourceAddress() {
            return sourceAddress;
        }

        public String getPayload() {
            return payload;
        }

        public String getTokenSymbol() {
            return tokenSymbol;
        }

        public Long getAmount() {
            return amount;
        }
    }
}