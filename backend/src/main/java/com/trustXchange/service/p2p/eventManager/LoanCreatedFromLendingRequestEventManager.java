package com.trustXchange.service.p2p.eventManager;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.entities.p2p.P2pLoanToLenderRequest;
import com.trustXchange.repository.p2p.P2pLoanRepository;
import com.trustXchange.repository.p2p.P2pLoanToLenderRequestRepository;
import com.trustXchange.service.p2p.EventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LoanCreatedFromLendingRequestEventData;

@Component
public class LoanCreatedFromLendingRequestEventManager  extends P2PEventManager<LoanCreatedFromLendingRequestEventData> {
    @Autowired
    private P2pLoanRepository loanRepository;
    @Autowired
    private P2pLoanToLenderRequestRepository loanToLenderRequestRepository;

     @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event LOAN_CREATED_FROM_LENDING_REQUEST_EVENT = new Event(
        "LoanCreatedFromLendingRequest",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
             new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );
    
    @Autowired
    public LoanCreatedFromLendingRequestEventManager() {
        super(LOAN_CREATED_FROM_LENDING_REQUEST_EVENT);
    }

     public LoanCreatedFromLendingRequestEventData decode(Log log) {
        List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        BigInteger loanId = (BigInteger) nonIndexedValues.get(0);
        BigInteger requestId = (BigInteger) nonIndexedValues.get(1);
        String lender = (String) nonIndexedValues.get(2);
        String borrower = (String) nonIndexedValues.get(3);
        BigInteger amountBorrowedUSD = (BigInteger) nonIndexedValues.get(4);
        BigInteger collateralAmountXRP = (BigInteger) nonIndexedValues.get(5);
        BigInteger amountPayableToLender = (BigInteger) nonIndexedValues.get(6);
        BigInteger amountPayableToPlatform = (BigInteger) nonIndexedValues.get(7);
        BigInteger repayBy = (BigInteger) nonIndexedValues.get(8);
        BigInteger liquidationThreshold = (BigInteger) nonIndexedValues.get(9);


        return new LoanCreatedFromLendingRequestEventData(
            loanId.intValue(),
            requestId.intValue(),
            lender,
            borrower,
            amountBorrowedUSD,
            collateralAmountXRP,
                amountPayableToLender,
            amountPayableToPlatform,
            repayBy,
            liquidationThreshold
        );
    }


    public void handle(LoanCreatedFromLendingRequestEventData eventData) {
        P2pLoan loan = new P2pLoan();
        loan.setLoanId(eventData.getLoanId());
        loan.setLender(eventData.getLender());
        loan.setBorrower(eventData.getBorrower());
        loan.setAmountBorrowedUsd(eventData.getAmountBorrowedUSD().longValue());
        loan.setCollateralAmountXrp(eventData.getCollateralAmountXRP().longValue());
        loan.setAmountPayableToLender(eventData.getAmountPayableToLender().longValue());
        loan.setAmountPayableToPlatform(eventData.getAmountPayableToPlatform().longValue());
        loan.setAmountPaidUsd(Long.valueOf(0));
        loan.setRepayBy(new java.sql.Timestamp(eventData.getRepayBy().longValue() * 1000));
        loan.setLiquidationThreshold(eventData.getLiquidationThreshold().longValue());
        loan.setLiquidated(false);
        loanRepository.save(loan);

        P2pLoanToLenderRequest p2pLoanToLenderRequest = new P2pLoanToLenderRequest();
        p2pLoanToLenderRequest.setLoanId(eventData.getLoanId());
        p2pLoanToLenderRequest.setLendRequestId(eventData.getRequestId());
        loanToLenderRequestRepository.save(p2pLoanToLenderRequest);
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}