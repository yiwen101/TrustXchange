package com.trustXchange.service.p2p.eventManager;

import com.trustXchange.entities.p2p.P2pBorrowingRequestEvent;
import com.trustXchange.entities.p2p.P2pLendingRequestEvent;
import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.entities.p2p.P2pLoanEvent;
import com.trustXchange.repository.p2p.P2pBorrowingRequestEventRepository;
import com.trustXchange.repository.p2p.P2pLendingRequestEventRepository;
import com.trustXchange.repository.p2p.P2pLoanEventRepository;
import com.trustXchange.repository.p2p.P2pLoanRepository;
import com.trustXchange.service.p2p.P2PEventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LoanEventData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.abi.datatypes.Bool;

import javax.annotation.PostConstruct;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;

@Component
public class LoanEventManager  extends P2PEventManager<LoanEventData> {
     @Autowired
    private P2PEventManagerRegistry eventManagerRegistry;

    @Autowired
    private P2pLoanRepository p2pLoanRepository;

    @Autowired
    private P2pLoanEventRepository p2pLoanEventRepository;

    @Autowired
    private P2pLendingRequestEventRepository p2pLendingRequestEventRepository;

    @Autowired
    private P2pBorrowingRequestEventRepository p2pBorrowingRequestEventRepository;

    public static final Event LOAN_EVENT = new Event(
        "LoanEvent",
        Arrays.asList(
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
             new TypeReference<Uint256>(false) {},
             new TypeReference<Bool>(false) {}
        )
    );

    @Autowired
    public LoanEventManager() {
        super(LOAN_EVENT);
    }

    @Override
    public LoanEventData decode(Log log) {
           List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        String eventName = (String) nonIndexedValues.get(0);
        BigInteger amount1 = (BigInteger) nonIndexedValues.get(1);
         BigInteger loanId = (BigInteger) nonIndexedValues.get(2);
         String lender = (String) nonIndexedValues.get(3);
          String borrower = (String) nonIndexedValues.get(4);
         BigInteger amountBorrowedUSD = (BigInteger) nonIndexedValues.get(5);
         BigInteger amountPayableToLender = (BigInteger) nonIndexedValues.get(6);
        BigInteger amountPayableToPlatform = (BigInteger) nonIndexedValues.get(7);
         BigInteger amountPaidUSD = (BigInteger) nonIndexedValues.get(8);
        BigInteger collateralAmountXRP = (BigInteger) nonIndexedValues.get(9);
          BigInteger repayBy = (BigInteger) nonIndexedValues.get(10);
          BigInteger liquidationThreshold = (BigInteger) nonIndexedValues.get(11);
        Boolean isLiquidated = (Boolean) nonIndexedValues.get(12);

        return new LoanEventData(eventName, amount1, loanId, lender, borrower, amountBorrowedUSD, amountPayableToLender,
         amountPayableToPlatform, amountPaidUSD, collateralAmountXRP, repayBy, liquidationThreshold, isLiquidated);
    }

     @Override
     public void handle(LoanEventData eventData) {
           P2pLoan p2pLoan = new P2pLoan();
           p2pLoan.setLoanId(eventData.getLoanId().intValue());
           p2pLoan.setLender(eventData.getLender());
           p2pLoan.setBorrower(eventData.getBorrower());
           p2pLoan.setAmountBorrowedUsd(eventData.getAmountBorrowedUSD().longValue());
            p2pLoan.setAmountPayableToLender(eventData.getAmountPayableToLender().longValue());
           p2pLoan.setAmountPayableToPlatform(eventData.getAmountPayableToPlatform().longValue());
            p2pLoan.setAmountPaidUsd(eventData.getAmountPaidUSD().longValue());
            p2pLoan.setCollateralAmountXrp(eventData.getCollateralAmountXRP().longValue());
            p2pLoan.setRepayBy(new Timestamp(eventData.getRepayBy().longValue() * 1000));
             p2pLoan.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
             p2pLoan.setIsLiquidated(eventData.isLiquidated());
             p2pLoan.setBorrowRequestId(null);
            p2pLoan.setLendRequestId(null);
             if (eventData.getEventName().equals("acceptBorrowingRequest")) {
                int borrowRequestId = eventData.getAmount().intValue();
                P2pBorrowingRequestEvent p2pBorrowingRequestEvent = new P2pBorrowingRequestEvent();
                p2pBorrowingRequestEvent.setTransactionHash(eventData.getTransactionHash());
                p2pBorrowingRequestEvent.setTransactionUrl(eventData.getTransactionUrl());
                p2pBorrowingRequestEvent.setRequestId(borrowRequestId);
                p2pBorrowingRequestEvent.setEventName(eventData.getEventName());
                p2pBorrowingRequestEventRepository.save(p2pBorrowingRequestEvent);
                
                p2pLoan.setBorrowRequestId(borrowRequestId);
             } else if (eventData.getEventName().equals("acceptLendingRequest")) {
                int lendRequestId = eventData.getAmount().intValue();
                P2pLendingRequestEvent p2pLendingRequestEvent = new P2pLendingRequestEvent();
                p2pLendingRequestEvent.setTransactionHash(eventData.getTransactionHash());
                p2pLendingRequestEvent.setTransactionUrl(eventData.getTransactionUrl());
                p2pLendingRequestEvent.setRequestId(lendRequestId);
                p2pLendingRequestEvent.setEventName(eventData.getEventName());
                p2pLendingRequestEventRepository.save(p2pLendingRequestEvent);
                
                p2pLoan.setLendRequestId(lendRequestId);
             }

        p2pLoanRepository.save(p2pLoan);

        P2pLoanEvent p2pLoanEvent = new P2pLoanEvent();
        p2pLoanEvent.setTransactionHash(eventData.getTransactionHash());
        p2pLoanEvent.setTransactionUrl(eventData.getTransactionUrl());
        p2pLoanEvent.setLoanId(eventData.getLoanId().intValue());
        p2pLoanEvent.setEventName(eventData.getEventName());
        p2pLoanEvent.setAmount(eventData.getAmount().longValue());
        p2pLoanEventRepository.save(p2pLoanEvent);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}