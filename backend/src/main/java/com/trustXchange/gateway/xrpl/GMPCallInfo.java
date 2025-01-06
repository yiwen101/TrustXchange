package com.trustXchange.gateway.xrpl;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.xrpl.xrpl4j.model.transactions.Address;
import org.xrpl.xrpl4j.model.transactions.CurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.IssuedCurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.Payment;
import org.xrpl.xrpl4j.model.transactions.XrpCurrencyAmount;

import com.trustXchange.DestinationChainNotSupportException;

import lombok.Getter;

@Getter
public class GMPCallInfo {

    public String destinationAddress;
    public String destinationChainHex;
    public String payloadHash;
    public Long amount;
    public String symbol;
    public String from;

    public GMPCallInfo(String destinationAddress, String destinationChainHex, String payloadHash, Long amount, String symbol, Address from) {
        this.destinationAddress = destinationAddress;
        this.destinationChainHex = destinationChainHex;
        this.payloadHash = payloadHash;
        this.amount = amount;
        this.from = from.value();
        this.symbol = symbol;
    }

    private static final String DESTINATION_ADDRESS_HEX = "64657374696E6174696F6E5F61646472657373";
    private static final String DESTINATION_CHAIN_HEX = "64657374696E6174696F6E5F636861696E";
    private static final String PAYLOAD_HEX = "7061796C6F61645F68617368";
    private static final List<String> MEMO_TYPES_EXPECTED = List.of(DESTINATION_ADDRESS_HEX, DESTINATION_CHAIN_HEX, PAYLOAD_HEX);

    private static final String XRPL_EVM_SIDECHAIN_HEX = "7872706C2D65766D2D73696465636861696E";
    
    public static Optional<GMPCallInfo> Of(Payment payment) throws DestinationChainNotSupportException{
        System.out.println("line 44 in GMPCALLINFO, payment: " + payment);
        Optional<GMPCallInfo> gmpCallInfo = Optional.empty();
        try {
        List<String> datas = new ArrayList<>(3);
        List<String> types = new ArrayList<>(3);
        System.out.println("line 49, memo size: " + payment.memos().size());
        for(int i=0; i<3; i++){
            Optional<String> memoData = payment.memos().get(i).memo().memoData();
            Optional<String> memoType = payment.memos().get(i).memo().memoType();
            if (!memoData.isPresent() || !memoType.isPresent()) {
                System.out.println("line 54, memoData: " + memoData);
                return gmpCallInfo;
            }
            datas.add(memoData.get());
            types.add(memoType.get());
        }
        System.out.println("line 60");
        if (!types.equals(MEMO_TYPES_EXPECTED) || !types.equals(MEMO_TYPES_EXPECTED)) {
            return gmpCallInfo;
        }
        String symbol;
        Long amount;
        CurrencyAmount currencyAmount = payment.amount();
        if (XrpCurrencyAmount.class.isAssignableFrom(currencyAmount.getClass())) {
            System.out.println("line 68, currencyAmount: " + currencyAmount);
            XrpCurrencyAmount xrpAmount = (XrpCurrencyAmount) currencyAmount;
            symbol = "XRP";
            amount = xrpAmount.toXrp().longValue();
        } else if (IssuedCurrencyAmount.class.isAssignableFrom(currencyAmount.getClass())) {
            System.out.println("line 73, currencyAmount: " + currencyAmount);
            IssuedCurrencyAmount issuedAmount = (IssuedCurrencyAmount) currencyAmount;
            if (!"rGo4HdEE3wXToTqcEGxCAeaFYfqiRGdWSX".equals(issuedAmount.issuer().value())) {
                return gmpCallInfo;
            }
            symbol = "USD";
            String decimalValueString = issuedAmount.value();
            BigDecimal decimalValue = new BigDecimal(decimalValueString);
            amount = decimalValue.longValue();
        } else {
            System.out.println("line 84, currencyAmount: " + currencyAmount);
            return gmpCallInfo;
        }

        
        String destinationAddress = datas.get(0);
        String destinationChainHex = datas.get(1);
        String payloadHash = datas.get(2);
        System.out.println("line 60, payloadHash: " + payloadHash);
       
        Address from = payment.account();

        if (!destinationChainHex.equals(XRPL_EVM_SIDECHAIN_HEX)) {
            System.out.println("line 68, destinationChainHex: " + destinationChainHex);
            return gmpCallInfo;
        }
        
       

        return Optional.of(new GMPCallInfo(destinationAddress, destinationChainHex, payloadHash, amount, symbol, from));
        } catch (Exception e) {
         System.out.println("line 76, error: " + e.getMessage());
            return gmpCallInfo;
        }
    }

    public String toString() {
        return String.format("From: %s\nDestination Address: %s\nDestination Chain: %s\nPayload Hash: %s\nAmount: %s\n", from, destinationAddress, destinationChainHex, payloadHash, amount);
    }  
}
