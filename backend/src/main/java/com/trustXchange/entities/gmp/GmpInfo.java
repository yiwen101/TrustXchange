package com.trustXchange.entities.gmp;

import javax.persistence.*;

import com.trustXchange.gateway.xrpl.GMPCallInfo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "gmp_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GmpInfo {
    @Id
    @Column(name = "transaction_hash", nullable = false)
    String transactionHash;
    @Column(name = "contract_transaction_hash", nullable = false)
    String contractTransactionHash;
    @Column(name = "gateway_transaction_hash", nullable = false)
    String gatewayTransactionHash;
    @Column(name = "destination_address", nullable = false)
    String destinationAddress;
    @Column(name = "destination_chain_hex", nullable = false)
    String destinationChainHex;
    @Column(name = "payload_hash", nullable = false)
    String payloadHash;
    @Column(name = "symbol", nullable = false)
    String symbol;
    @Column(name = "amount", nullable = false)
    Long amount;
    @Column(name = "from_address", nullable = false)
    String from;
    @Column(name = "is_received", nullable = false)
    Boolean isReceived;
    @Column(name = "is_approved", nullable = false)
    Boolean isApproved;
    @Column(name = "is_called", nullable = false)
    Boolean isCalled;

    public GmpInfo(String transactionHash, GMPCallInfo gmpCallInfo) {
        this.transactionHash = transactionHash;
        this.contractTransactionHash = "";
        this.gatewayTransactionHash = "";
        this.destinationAddress = gmpCallInfo.getDestinationAddress();
        this.destinationChainHex = gmpCallInfo.getDestinationChainHex();
        this.payloadHash = gmpCallInfo.getPayloadHash();
        this.symbol = gmpCallInfo.getSymbol();
        this.amount = gmpCallInfo.getAmount();
        this.from = gmpCallInfo.getFrom();
        this.isReceived = false;
        this.isApproved = false;
        this.isCalled = false;
    }
}
