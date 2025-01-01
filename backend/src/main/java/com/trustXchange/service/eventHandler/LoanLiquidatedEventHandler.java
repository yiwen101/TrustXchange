package com.trustXchange.service.eventHandler;

import com.trustXchange.repository.LoanRepository;
import com.trustXchange.service.eventData.LoanLiquidatedEventData;
import org.springframework.stereotype.Service;

@Service
public class LoanLiquidatedEventHandler {
    private LoanRepository loanRepository;

    public LoanLiquidatedEventHandler(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public void handle(LoanLiquidatedEventData eventData) {
        loanRepository.findById(eventData.getLoanId()).ifPresent(loan -> {
            loan.setLiquidated(true);
            loanRepository.save(loan);
        });
    }
}