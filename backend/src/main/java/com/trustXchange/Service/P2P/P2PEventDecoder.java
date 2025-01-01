package com.trustXchange.Service.P2P;

import com.trustXchange.DTO.P2P.BorrowingRequestAutoCanceledDTO;
import com.trustXchange.DTO.P2P.BorrowingRequestCanceledDTO;
import com.trustXchange.DTO.P2P.BorrowingRequestCreatedDTO;
import com.trustXchange.DTO.P2P.LendingRequestAutoCanceledDTO;
import com.trustXchange.DTO.P2P.LendingRequestCanceledDTO;
import com.trustXchange.DTO.P2P.LendingRequestCreatedDTO;
import com.trustXchange.DTO.P2P.LoanCreatedDTO;
import com.trustXchange.DTO.P2P.LoanLiquidatedDTO;
import com.trustXchange.DTO.P2P.LoanRepaidDTO;
import com.trustXchange.DTO.P2P.LoanUpdatedDTO;
import com.trustXchange.DTO.P2P.P2PEventData;
import com.trustXchange.DTO.P2P.PriceUpdatedDTO;
import com.trustXchange.DTO.P2P.RequestFilledDTO;

import java.util.List;
import java.util.Optional;

import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.core.methods.response.Log;

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
            case "RequestFilled":
                return Optional.of(decodeRequestFilledEvent(log));
            default:
                return Optional.empty();
        }
    }

    private static LoanCreatedDTO decodeLoanCreatedEvent(Log log) {
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
        return new LoanCreatedDTO(loanId, lender, borrower, amountBorrowedUSD, collateralAmountXRP, amountPayableToLender, amountPayableToPlatform, repayBy, liquidationThreshold);
    }

    private static LoanUpdatedDTO decodeLoanUpdatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LOAN_UPDATED_EVENT.getNonIndexedParameters());
        Uint256 loanId = (Uint256) values.get(0);
        Utf8String borrower = (Utf8String) values.get(1);
        Uint256 newAmountBorrowedUSD = (Uint256) values.get(2);
        Uint256 newCollateralAmountXRP = (Uint256) values.get(3);
        Uint256 newAmountPayableToLender = (Uint256) values.get(4);
        return new LoanUpdatedDTO(loanId, borrower, newAmountBorrowedUSD, newCollateralAmountXRP, newAmountPayableToLender);
    }

    private static LoanRepaidDTO decodeLoanRepaidEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LOAN_REPAID_EVENT.getNonIndexedParameters());
        Uint256 loanId = (Uint256) values.get(0);
        Uint256 amountRepaid = (Uint256) values.get(1);
        Uint256 totalPaid = (Uint256) values.get(2);
        return new LoanRepaidDTO(loanId, amountRepaid, totalPaid);
    }

    private static LoanLiquidatedDTO decodeLoanLiquidatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LOAN_LIQUIDATED_EVENT.getNonIndexedParameters());
        Uint256 loanId = (Uint256) values.get(0);
        Utf8String liquidator = (Utf8String) values.get(1);
        Uint256 collateralLiquidated = (Uint256) values.get(2);
        return new LoanLiquidatedDTO(loanId, liquidator, collateralLiquidated);
    }

    private static PriceUpdatedDTO decodePriceUpdatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.PRICE_UPDATED_EVENT.getNonIndexedParameters());
        Uint256 newPrice = (Uint256) values.get(0);
        return new PriceUpdatedDTO(newPrice);
    }

    private static LendingRequestCreatedDTO decodeLendingRequestCreatedEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LENDING_REQUEST_CREATED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Utf8String lender = (Utf8String) values.get(1);
        Uint256 amountToLendUSD = (Uint256) values.get(2);
        Uint256 minCollateralRatio = (Uint256) values.get(3);
        Uint256 liquidationThreshold = (Uint256) values.get(4);
        Uint256 desiredInterestRate = (Uint256) values.get(5);
        Uint256 paymentDuration = (Uint256) values.get(6);
        Uint256 minimalPartialFill = (Uint256) values.get(7);
        return new LendingRequestCreatedDTO(requestId, lender, amountToLendUSD, minCollateralRatio, liquidationThreshold, desiredInterestRate, paymentDuration, minimalPartialFill);
    }

    private static BorrowingRequestCreatedDTO decodeBorrowingRequestCreatedEvent(Log log) {
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
        return new BorrowingRequestCreatedDTO(requestId, borrower, amountToBorrowUSD, collateralAmountXRP, maxCollateralRatio, liquidationThreshold, desiredInterestRate, paymentDuration, minimalPartialFill);
    }

    private static LendingRequestCanceledDTO decodeLendingRequestCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LENDING_REQUEST_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Utf8String canceller = (Utf8String) values.get(1);
        return new LendingRequestCanceledDTO(requestId, canceller);
    }

    private static BorrowingRequestCanceledDTO decodeBorrowingRequestCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.BORROWING_REQUEST_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Utf8String canceller = (Utf8String) values.get(1);
        return new BorrowingRequestCanceledDTO(requestId, canceller);
    }

    private static LendingRequestAutoCanceledDTO decodeLendingRequestAutoCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.LENDING_REQUEST_AUTO_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        return new LendingRequestAutoCanceledDTO(requestId);
    }

    private static BorrowingRequestAutoCanceledDTO decodeBorrowingRequestAutoCanceledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.BORROWING_REQUEST_AUTO_CANCELED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        return new BorrowingRequestAutoCanceledDTO(requestId);
    }

    private static RequestFilledDTO decodeRequestFilledEvent(Log log) {
        List<?> values = FunctionReturnDecoder.decode(log.getData(), P2PContractEvents.REQUEST_FILLED_EVENT.getNonIndexedParameters());
        Uint256 requestId = (Uint256) values.get(0);
        Uint256 amountFilled = (Uint256) values.get(1);
        return new RequestFilledDTO(requestId, amountFilled);
    }
}