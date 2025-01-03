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

import com.trustXchange.repository.p2p.P2pLoanRepository;
import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.p2p.eventData.LoanUpdatedEventData;


@Component
public class LoanUpdatedEventManager  extends P2PEventManager<LoanUpdatedEventData> {
    @Autowired
    private P2pLoanRepository loanRepository;

     @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event LOAN_UPDATED_EVENT = new Event(
        "LoanUpdated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
            new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );

    @Autowired
    public LoanUpdatedEventManager() {
        super(LOAN_UPDATED_EVENT);
    }

    public LoanUpdatedEventData decode(Log log) {
          List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        BigInteger loanId = (BigInteger) nonIndexedValues.get(0);
        String borrower = (String) nonIndexedValues.get(1);
        BigInteger newAmountBorrowedUSD = (BigInteger) nonIndexedValues.get(2);
        BigInteger newCollateralAmountXRP = (BigInteger) nonIndexedValues.get(3);
        BigInteger newAmountPayableToLender = (BigInteger) nonIndexedValues.get(4);

        return new LoanUpdatedEventData(
            loanId.intValue(),
            borrower,
            newAmountBorrowedUSD,
            newCollateralAmountXRP,
            newAmountPayableToLender
        );
    }

    public void handle(LoanUpdatedEventData eventData) {
        loanRepository.findById(eventData.getLoanId()).ifPresent(loan -> {
            loan.setAmountBorrowedUsd(eventData.getNewAmountBorrowedUSD().longValue());
            loan.setCollateralAmountXrp(eventData.getNewCollateralAmountXRP().longValue());
            loan.setAmountPayableToLender(eventData.getNewAmountPayableToLender().longValue());
            loanRepository.save(loan);
        });
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}