package com.trustXchange.service.eventHandler;

import com.trustXchange.repository.LoanRepository;
import com.trustXchange.service.eventData.LoanRepaidEventData;
import org.springframework.stereotype.Service;

@Service
public class LoanRepaidEventHandler {
    private LoanRepository loanRepository;

    public LoanRepaidEventHandler(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public void handle(LoanRepaidEventData eventData) {
        loanRepository.findById(eventData.getLoanId()).ifPresent(loan -> {
            loan.setAmountPaidUSD(eventData.getTotalPaid().doubleValue());
            loanRepository.save(loan);
        });

    }
}