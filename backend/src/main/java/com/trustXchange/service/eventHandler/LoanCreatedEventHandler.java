package com.trustXchange.service.eventHandler;


import com.trustXchange.entity.LoanEntity;
import com.trustXchange.repository.LoanRepository;
import com.trustXchange.service.eventData.LoanCreatedEventData;
import org.springframework.stereotype.Service;


@Service
public class LoanCreatedEventHandler {
    private LoanRepository loanRepository;

    public LoanCreatedEventHandler(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public void handle(LoanCreatedEventData eventData) {
        LoanEntity loan = new LoanEntity();
        loan.setLoanId(eventData.getLoanId());
        loan.setLender(eventData.getLender());
        loan.setBorrower(eventData.getBorrower());
        loan.setAmountBorrowedUSD(eventData.getAmountBorrowedUSD().doubleValue());
        loan.setAmountPayableToLender(eventData.getAmountPayableToLender().doubleValue());
        loan.setAmountPayableToPlatform(eventData.getAmountPayableToPlatform().doubleValue());
        loan.setAmountPaidUSD(0.0);
        loan.setCollateralAmountXRP(eventData.getCollateralAmountXRP().doubleValue());
        loan.setRepayBy(java.sql.Timestamp.from(eventData.getRepayBy()));
        loan.setLiquidationThreshold(eventData.getLiquidationThreshold().doubleValue());
        loan.setLiquidated(false);


        loanRepository.save(loan);
    }
}