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
import com.trustXchange.service.p2p.eventData.LoanLiquidatedEventData;


@Component
public class LoanLiquidatedEventManager  extends P2PEventManager<LoanLiquidatedEventData> {
    @Autowired
    private P2pLoanRepository loanRepository;

     @Autowired
    private EventManagerRegistry eventManagerRegistry;

    public static final Event LOAN_LIQUIDATED_EVENT = new Event(
        "LoanLiquidated",
        Arrays.asList(
            new TypeReference<Uint256>(false) {},
             new TypeReference<Utf8String>(false) {},
            new TypeReference<Uint256>(false) {}
        )
    );
    @Autowired
    public LoanLiquidatedEventManager() {
        super(LOAN_LIQUIDATED_EVENT);
    }

    public LoanLiquidatedEventData decode(Log log) {
        List<Object> nonIndexedValues = getNonIndexedValuesOf(log);
        Uint256 loanId = (Uint256) nonIndexedValues.get(0);
         Utf8String liquidator = (Utf8String) nonIndexedValues.get(1);
        Uint256 collateralLiquidated = (Uint256) nonIndexedValues.get(2);
        return new LoanLiquidatedEventData(
            loanId.getValue().intValue(),
                liquidator.getValue(),
            collateralLiquidated.getValue()
        );
    }

    public void handle(LoanLiquidatedEventData eventData) {
        loanRepository.findById(eventData.getLoanId()).ifPresent(loan -> {
            loan.setLiquidated(true);
           // log the liquidator info as well?
            loanRepository.save(loan);
        });
    }

    @PostConstruct
    private void register(){
       eventManagerRegistry.register(this);
   }
}