package com.trustXchange.service;

import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

import com.trustXchange.service.eventData.BorrowingRequestAutoCanceledEventData;
import com.trustXchange.service.eventData.BorrowingRequestCanceledEventData;
import com.trustXchange.service.eventData.BorrowingRequestCreatedEventData;
import com.trustXchange.service.eventData.BorrowingRequestFilledEventData;
import com.trustXchange.service.eventData.LendingRequestAutoCanceledEventData;
import com.trustXchange.service.eventData.LendingRequestCanceledEventData;
import com.trustXchange.service.eventData.LendingRequestCreatedEventData;
import com.trustXchange.service.eventData.LendingRequestFilledEventData;
import com.trustXchange.service.eventData.LoanCreatedEventData;
import com.trustXchange.service.eventData.LoanLiquidatedEventData;
import com.trustXchange.service.eventData.LoanRepaidEventData;
import com.trustXchange.service.eventData.LoanUpdatedEventData;
import com.trustXchange.service.eventData.P2PEventData;
import com.trustXchange.service.eventData.PriceUpdatedEventData;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class P2PEventDecoder {
    public static Optional<P2PEventData> decode(Log log) {
        Optional<Event> event = P2PContractEvents.getEventWithHash(log.getTopics().get(0));
        if (event.isEmpty()) {
            return Optional.empty();
        }
        switch (event.get().getName()) {
            case "LoanCreated":
                return Optional.of(decodeLoanCreatedEvent(log));
            case "LoanUpdated":
                return Optional.of(decodeLoanUpdatedEvent(log));
            case "LoanRepaid":
                return Optional.of(decodeLoanRepaidEvent(log));
            case "LoanLiquidated":
                return Optional.of(decodeLoanLiquidatedEvent(log));
            case "PriceUpdated":
                return Optional.of(decodePriceUpdatedEvent(log));
            case "LendingRequestCreated":
                return Optional.of(decodeLendingRequestCreatedEvent(log));
            case "BorrowingRequestCreated":
                return Optional.of(decodeBorrowingRequestCreatedEvent(log));
            case "LendingRequestCanceled":
                return Optional.of(decodeLendingRequestCanceledEvent(log));
            case "BorrowingRequestCanceled":
                return Optional.of(decodeBorrowingRequestCanceledEvent(log));
            case "LendingRequestAutoCanceled":
                return Optional.of(decodeLendingRequestAutoCanceledEvent(log));
            case "BorrowingRequestAutoCanceled":
                return Optional.of(decodeBorrowingRequestAutoCanceledEvent(log));
            case "LendingRequestFilled":
                return Optional.of(decodeLendingRequestFilledEvent(log));
            case "BorrowingRequestFilled":
                return Optional.of(decodeBorrowingRequestFilledEvent(log));
            default:
                return Optional.empty();
        }
    }

    private static LoanCreatedEventData decodeLoanCreatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LOAN_CREATED_EVENT.getNonIndexedParameters());
        Uint256 loanId = (Uint256) values.get(0);
        Utf8String lender = (Utf8String) values.get(1);
        Utf8String borrower = (Utf8String) values.get(2);
        Uint256 amountBorrowedUSD = (Uint256) values.get(3);
        Uint256 collateralAmountXRP = (Uint256) values.get(4);
        Uint256 amountPayableToLender = (Uint256) values.get(5);
        Uint256 amountPayableToPlatform = (Uint256) values.get(6);
        Uint256 repayBy = (Uint256) values.get(7);
        Uint256 liquidationThreshold = (Uint256) values.get(8);
        return new LoanCreatedEventData(
            loanId.getValue().intValue(),
            lender.getValue(),
            borrower.getValue(),
            new BigDecimal(amountBorrowedUSD.getValue()),
            new BigDecimal(collateralAmountXRP.getValue()),
            new BigDecimal(amountPayableToLender.getValue()),
            new BigDecimal(amountPayableToPlatform.getValue()),
            Instant.ofEpochSecond(repayBy.getValue().longValue()),
            new BigDecimal(liquidationThreshold.getValue())
        );
    }

    private static LoanUpdatedEventData decodeLoanUpdatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LOAN_UPDATED_EVENT.getNonIndexedParameters());
        Uint256 loanId = (Uint256) values.get(0);
        Utf8String borrower = (Utf8String) values.get(1);
        Uint256 newAmountBorrowedUSD = (Uint256) values.get(2);
        Uint256 newCollateralAmountXRP = (Uint256) values.get(3);
        Uint256 newAmountPayableToLender = (Uint256) values.get(4);
        return new LoanUpdatedEventData(
            loanId.getValue().intValue(),
            borrower.getValue(),
            new BigDecimal(newAmountBorrowedUSD.getValue()),
            new BigDecimal(newCollateralAmountXRP.getValue()),
            new BigDecimal(newAmountPayableToLender.getValue())
        );
    }

    private static LoanRepaidEventData decodeLoanRepaidEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LOAN_REPAID_EVENT.getNonIndexedParameters());
        Uint256 loanId = (Uint256) values.get(0);
        Uint256 amountRepaid = (Uint256) values.get(1);
        Uint256 totalPaid = (Uint256) values.get(2);
        return new LoanRepaidEventData(
            loanId.getValue().intValue(),
            new BigDecimal(amountRepaid.getValue()),
            new BigDecimal(totalPaid.getValue())
        );
    }

    private static LoanLiquidatedEventData decodeLoanLiquidatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LOAN_LIQUIDATED_EVENT.getNonIndexedParameters());
        Uint256 loanId = (Uint256) values.get(0);
        Utf8String liquidator = (Utf8String) values.get(1);
        Uint256 collateralLiquidated = (Uint256) values.get(2);
        return new LoanLiquidatedEventData(
            loanId.getValue().intValue(),
            liquidator.getValue(),
            new BigDecimal(collateralLiquidated.getValue())
        );
    }

    private static PriceUpdatedEventData decodePriceUpdatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.PRICE_UPDATED_EVENT.getNonIndexedParameters());
        Uint256 newPrice = (Uint256) values.get(0);
        return new PriceUpdatedEventData(new BigDecimal(newPrice.getValue()));
    }

    private static LendingRequestCreatedEventData decodeLendingRequestCreatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LENDING_REQUEST_CREATED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Utf8String lender = (Utf8String) values.get(1);
        Uint256 amountToLendUSD = (Uint256) values.get(2);
        Uint256 minCollateralRatio = (Uint256) values.get(3);
        Uint256 liquidationThreshold = (Uint256) values.get(4);
        Uint256 desiredInterestRate = (Uint256) values.get(5);

        Uint256 paymentDuration = (Uint256) values.get(6);
        Uint256 minimalPartialFill = (Uint256) values.get(7);
        return new LendingRequestCreatedEventData(
            requestId.getValue().intValue(),
            lender.getValue(),
            new BigDecimal(amountToLendUSD.getValue()),
            new BigDecimal(minCollateralRatio.getValue()),
            new BigDecimal(liquidationThreshold.getValue()),
            new BigDecimal(desiredInterestRate.getValue()),
            Duration.ofSeconds(paymentDuration.getValue().longValue()),
            new BigDecimal(minimalPartialFill.getValue())
        );
    }

    private static BorrowingRequestCreatedEventData decodeBorrowingRequestCreatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.BORROWING_REQUEST_CREATED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Utf8String borrower = (Utf8String) values.get(1);
        Uint256 amountToBorrowUSD = (Uint256) values.get(2);
        Uint256 collateralAmountXRP = (Uint256) values.get(3);
        Uint256 maxCollateralRatio = (Uint256) values.get(4);
        Uint256 liquidationThreshold = (Uint256) values.get(5);
        Uint256 desiredInterestRate = (Uint256) values.get(6);
        Uint256 paymentDuration = (Uint256) values.get(7);
        Uint256 minimalPartialFill = (Uint256) values.get(8);
        return new BorrowingRequestCreatedEventData(
            requestId.getValue().intValue(),
            borrower.getValue(),
            new BigDecimal(amountToBorrowUSD.getValue()),
            new BigDecimal(collateralAmountXRP.getValue()),
            new BigDecimal(maxCollateralRatio.getValue()),
            new BigDecimal(liquidationThreshold.getValue()),
            new BigDecimal(desiredInterestRate.getValue()),
            Duration.ofSeconds(paymentDuration.getValue().longValue()),
            new BigDecimal(minimalPartialFill.getValue()
            )
        );
    }

    private static LendingRequestCanceledEventData decodeLendingRequestCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LENDING_REQUEST_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Utf8String canceller = (Utf8String) values.get(1);
        return new LendingRequestCanceledEventData(
            requestId.getValue().intValue(),
            canceller.getValue()
        );
    }

    private static BorrowingRequestCanceledEventData decodeBorrowingRequestCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.BORROWING_REQUEST_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Utf8String canceller = (Utf8String) values.get(1);
        return new BorrowingRequestCanceledEventData(
            requestId.getValue().intValue(),
            canceller.getValue()
        );
    }

    private static LendingRequestAutoCanceledEventData decodeLendingRequestAutoCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LENDING_REQUEST_AUTO_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        return new LendingRequestAutoCanceledEventData(requestId.getValue().intValue());
    }

    private static BorrowingRequestAutoCanceledEventData decodeBorrowingRequestAutoCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.BORROWING_REQUEST_AUTO_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        return new BorrowingRequestAutoCanceledEventData(requestId.getValue().intValue());
    }

    private static LendingRequestFilledEventData decodeLendingRequestFilledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LENDING_REQUEST_FILLED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Uint256 loanId = (Uint256) values.get(1);
        return new LendingRequestFilledEventData(
            requestId.getValue().intValue(),
            loanId.getValue().intValue()
        );
    }
    private static BorrowingRequestFilledEventData decodeBorrowingRequestFilledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.BORROWING_REQUEST_FILLED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Uint256 loanId = (Uint256) values.get(1);
        return new BorrowingRequestFilledEventData(
            requestId.getValue().intValue(),
            loanId.getValue().intValue()
        );
    }
    
}