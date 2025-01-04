package com.trustXchange.service.common;

public class EventData {
    public String transactionHash;

    public void setTransactionHash(String transactionHash) {
        this.transactionHash = transactionHash;
    }

    public String getTransactionUrl() {
        return "https://explorer.xrplevm.org/tx/" + transactionHash;
    }

    public String getTransactionHash() {
        return transactionHash;
    }
}
