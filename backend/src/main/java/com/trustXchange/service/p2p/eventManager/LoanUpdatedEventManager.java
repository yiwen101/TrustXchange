package com.trustXchange.service.p2p.eventManager;

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
import com.trustXchange.service.p2p.EventManagerRegistry;
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
        Uint256 loanId = (Uint256) nonIndexedValues.get(0);
        Utf8String borrower = (Utf8String) nonIndexedValues.get(1);
        Uint256 newAmountBorrowedUSD = (Uint256) nonIndexedValues.get(2);
        Uint256 newCollateralAmountXRP = (Uint256) nonIndexedValues.get(3);
        Uint256 newAmountPayableToLender = (Uint256) nonIndexedValues.get(4);

        return new LoanUpdatedEventData(
            loanId.getValue().intValue(),
            borrower.getValue(),
            newAmountBorrowedUSD.getValue(),
            newCollateralAmountXRP.getValue(),
            newAmountPayableToLender.getValue()
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