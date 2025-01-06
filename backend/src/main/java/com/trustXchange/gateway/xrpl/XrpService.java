package com.trustXchange.gateway.xrpl;

import org.springframework.stereotype.Component;
import org.xrpl.xrpl4j.client.JsonRpcClientErrorException;
import org.xrpl.xrpl4j.client.XrplClient;
import org.xrpl.xrpl4j.codec.addresses.UnsignedByte;
import org.xrpl.xrpl4j.codec.addresses.UnsignedByteArray;
import org.xrpl.xrpl4j.crypto.keys.Base58EncodedSecret;
import org.xrpl.xrpl4j.crypto.keys.KeyPair;
import org.xrpl.xrpl4j.crypto.keys.PrivateKey;
import org.xrpl.xrpl4j.crypto.keys.PublicKey;
import org.xrpl.xrpl4j.crypto.keys.Seed;
import org.xrpl.xrpl4j.crypto.signing.SignatureService;
import org.xrpl.xrpl4j.crypto.signing.SingleSignedTransaction;
import org.xrpl.xrpl4j.model.client.accounts.AccountInfoResult;
import org.xrpl.xrpl4j.model.client.transactions.SubmitResult;
import org.xrpl.xrpl4j.model.transactions.Address;
import org.xrpl.xrpl4j.model.transactions.Payment;
import org.xrpl.xrpl4j.model.transactions.XrpCurrencyAmount;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.xrpl.xrpl4j.model.transactions.CurrencyAmount;
import org.xrpl.xrpl4j.model.transactions.IssuedCurrencyAmount;
import org.xrpl.xrpl4j.crypto.signing.bc.BcSignatureService;

import okhttp3.HttpUrl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;

import java.util.concurrent.CompletableFuture;

@Component
public class XrpService {
    private static final Logger logger = LoggerFactory.getLogger(XrpService.class);
    private XrplClient xrplClient;
    private SignatureService signatureService;
    private Seed seed;
    private PrivateKey senderPrivateKey;
    private PublicKey senderPublicKey;
    private Address senderAddress;

    private static final String RIPPLED_URL = "https://s.devnet.rippletest.net:51234/";
    private static final String ADDRESS = "rGo4HdEE3wXToTqcEGxCAeaFYfqiRGdWSX";
    private static final String PRIVATE_KEY = "EDF6E99F4FB5C9124B538EB55C3F88254D220F0EA251331E18265F86491E5E6BB0";
    private static final String WALLET_SECRET = "sEdVms9ZY4tgP6viMxJWK4q1pKjzFSm";
    @PostConstruct
    public void init() {
        HttpUrl rippledUrl = HttpUrl.get(RIPPLED_URL);
        xrplClient = new XrplClient(rippledUrl);
        signatureService = new BcSignatureService();
        Base58EncodedSecret base58EncodedSecret = Base58EncodedSecret.of(WALLET_SECRET);
        seed = Seed.fromBase58EncodedSecret(base58EncodedSecret);
        KeyPair keyPair = seed.deriveKeyPair();
        senderPrivateKey = keyPair.privateKey();
        senderPublicKey = keyPair.publicKey();
        senderAddress = senderPublicKey.deriveAddress();
        logger.info("XrpService initialized for address: {}", senderAddress);
    }

    public SubmitResult<Payment> sendXrp(String destination, String amount)  throws JsonRpcClientErrorException, JsonProcessingException {
        Payment payment = Payment.builder()
                .account(senderAddress)
                .destination(Address.of(destination))
                .amount(XrpCurrencyAmount.ofDrops(Long.parseLong(amount)))
                .build();

        SingleSignedTransaction<Payment> signedTransaction = signatureService.sign(senderPrivateKey, payment);
        return xrplClient.submit(signedTransaction);
    }

    public SubmitResult<Payment> sendIssuedCurrency(String destination, String currency, String issuer, String amount)  throws JsonRpcClientErrorException, JsonProcessingException {
        Payment payment = Payment.builder()
                .account(senderAddress)
                .destination(Address.of(destination))
                .amount(IssuedCurrencyAmount.builder()
                        .currency(currency)
                        .issuer(Address.of(issuer))
                        .value(amount)
                        .build())
                .build();

        SingleSignedTransaction<Payment> signedTransaction = signatureService.sign(senderPrivateKey, payment);
        return xrplClient.submit(signedTransaction);
    }
}