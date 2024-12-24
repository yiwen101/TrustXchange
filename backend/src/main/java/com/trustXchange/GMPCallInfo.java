package com.trustXchange;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.xrpl.xrpl4j.model.transactions.Address;
import org.xrpl.xrpl4j.model.transactions.CurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.Payment;
public class GMPCallInfo {
    public String destinationAddress;
    public String destinationChainHex;
    public String payloadHash;
    public CurrencyAmount amount;
    public Address from;

    public GMPCallInfo(String destinationAddress, String destinationChainHex, String payloadHash, CurrencyAmount amount, Address from) {
        this.destinationAddress = destinationAddress;
        this.destinationChainHex = destinationChainHex;
        this.payloadHash = payloadHash;
        this.amount = amount;
        this.from = from;
    }

    private static final String DESTINATION_ADDRESS_HEX = "64657374696E6174696F6E5F61646472657373";
    private static final String DESTINATION_CHAIN_HEX = "64657374696E6174696F6E5F636861696E";
    private static final String PAYLOAD_HEX = "7061796C6F61645F68617368";
    private static final List<String> MEMO_TYPES_EXPECTED = List.of(DESTINATION_ADDRESS_HEX, DESTINATION_CHAIN_HEX, PAYLOAD_HEX);

    private static final String XRPL_EVM_SIDECHAIN_HEX = "7872706C2D65766D2D73696465636861696E";
    
    public static Optional<GMPCallInfo> Of(Payment payment) throws DestinationChainNotSupportException{
        Optional<GMPCallInfo> gmpCallInfo = Optional.empty();
        List<String> datas = new ArrayList<>(3);
        List<String> types = new ArrayList<>(3);
        
        for(int i=0; i<3; i++){
            Optional<String> memoData = payment.memos().get(i).memo().memoData();
            Optional<String> memoType = payment.memos().get(i).memo().memoType();
            if (!memoData.isPresent() || !memoType.isPresent()) {
                return gmpCallInfo;
            }
            datas.add(memoData.get());
            types.add(memoType.get());
        }
        if (!types.equals(MEMO_TYPES_EXPECTED) || !types.equals(MEMO_TYPES_EXPECTED)) {
            return gmpCallInfo;
        }

        String destinationAddress = datas.get(0);
        String destinationChainHex = datas.get(1);
        String payloadHash = datas.get(2);
        Address from = payment.account();

        if (!destinationChainHex.equals(XRPL_EVM_SIDECHAIN_HEX)) {
            throw new DestinationChainNotSupportException();
        }
        CurrencyAmount amount = payment.amount();

        return Optional.of(new GMPCallInfo(destinationAddress, destinationChainHex, payloadHash, amount, from));
    }

    public String toString() {
        return String.format("From: %s\nDestination Address: %s\nDestination Chain: %s\nPayload Hash: %s\nAmount: %s\n", from, destinationAddress, destinationChainHex, payloadHash, amount);
    }  
}
