package com.trustXchange.gateway.evm.call;
// GmpUtil.java
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;

import com.trustXchange.gateway.evm.call.types.ExecuteParams;
import com.trustXchange.gateway.evm.call.types.ExecuteWithTokenParams;
import com.trustXchange.gateway.evm.call.types.GmpInputs;
import com.trustXchange.gateway.evm.call.types.GmpWithTokenInputs;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

public class GmpUtil {

    public static GmpInputs getGmpInputs(String sourceChain, String sourceAddress, String contractAddress, String payloadBytes) {
        BigInteger chainId = BigInteger.ONE; // Example Chain ID
        String payloadHash = Hash.sha3(payloadBytes);
        String sourceTxHash = Numeric.toHexString(Hash.sha3("ignored".getBytes(StandardCharsets.UTF_8)));
        // todo, add sourceEventIndex
        long sourceEventIndex = 0;

        String param = createGatewayCallParams(sourceChain, sourceAddress, contractAddress, payloadHash, sourceTxHash, sourceEventIndex);
        String commandName =  "approveContractCall";
        String commandId = createCommandId(commandName, param, 17);
        
        List<String> commandIds = Collections.singletonList(commandId);
        List<String> commands = Collections.singletonList(commandName);
        List<String> params = Collections.singletonList(param);

        String data = prepareCommandData(chainId, 
                commandIds.stream().map(Numeric::hexStringToByteArray).collect(Collectors.toList()), 
                commands, 
                params.stream().map(s -> Numeric.hexStringToByteArray(s)).collect(Collectors.toList()));
        byte[] proof = "some_proof".getBytes(StandardCharsets.UTF_8);
        String inputData = prepareExecuteInput(data, proof);
       
        ExecuteParams executeParams = new ExecuteParams(commandId, sourceChain, sourceAddress, payloadBytes);

        return new GmpInputs(inputData, executeParams);
    }

    public static GmpWithTokenInputs getGMPWithTokenInputs(String sourceAddress, String contractAddress, String payloadBytes, String tokenSymbol, Long tokenAmount) {
        BigInteger chainId = BigInteger.ONE; // Example Chain ID
        String payloadHash = Hash.sha3(payloadBytes);
        String sourceChain = "XRPL_testnet";
        String sourceTxHash = Numeric.toHexString(Hash.sha3("ignored".getBytes(StandardCharsets.UTF_8)));
        long sourceEventIndex = 0;

        String param = createGatewayCallWithMintParams(sourceChain, sourceAddress, contractAddress, payloadHash, tokenSymbol, tokenAmount, sourceTxHash, sourceEventIndex);
        String commandName =  "approveContractCallWithMint";
        // todo, dynamically create command Id
        String commandId = createCommandId(commandName, param, 17);
        
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

        

        ExecuteWithTokenParams executeWithTokenParams = new ExecuteWithTokenParams(commandId, sourceChain, sourceAddress, payloadBytes, tokenSymbol, tokenAmount);
        return new GmpWithTokenInputs(inputData, executeWithTokenParams);
    }

    private static final String keccak256(String input) {
        return Numeric.toHexString(Hash.sha3(input.getBytes(StandardCharsets.UTF_8)));
    }

    private static String prepareCommandData(BigInteger chainId, List<byte[]> commandIds, List<String> commands, List<byte[]> params) {
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

    private static String prepareExecuteInput(String data, byte[] proof) {
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

    private static String createCommandId(String commandName, String paramBytes, long nonce) {
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

    private static String createGatewayCallParams(String sourceChain, String sourceAddress, String contractAddress,
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

    private static String createGatewayCallWithMintParams(String sourceChain, String sourceAddress, String contractAddress,
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
}