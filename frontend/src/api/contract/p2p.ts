import { ethers } from 'ethers';
import * as xrpl from 'xrpl';
import { gmp_and_call_backend } from '../gmp/util';

const contractAddress = "0x99006642Dc5F79eBeF9dCAf3e95bd7DA0452C58E";


function prepareLendingRequestPayload(
    minCollateralRatio: number,
    liquidationThreshold: number,
    desiredInterestRate: number,
    paymentDuration: number,
    minimalPartialFill: number
): string {
    const command = "createLendingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256"],
        [minCollateralRatio, liquidationThreshold, desiredInterestRate, paymentDuration, minimalPartialFill]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareBorrowingRequestPayload(
    amountToBorrowUSD: number,
    maxCollateralRatio: number,
    liquidationThreshold: number,
    desiredInterestRate: number,
    paymentDuration: number,
    minimalPartialFill: number
): string {
    const command = "createBorrowingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
        [amountToBorrowUSD, maxCollateralRatio, liquidationThreshold, desiredInterestRate, paymentDuration, minimalPartialFill]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareAcceptLendingRequestPayload(
    requestId: number,
    borrowAmountUSD: number
): string {
    const command = "acceptLendingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [requestId, borrowAmountUSD]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareAcceptBorrowingRequestPayload(
    requestId: number,
    collateralAmountXRP: number
): string {
    const command = "acceptBorrowingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [requestId, collateralAmountXRP]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareRepayLoanPayload(
    repayAmountUSD: number,
    loanId: number
): string {
    const command = "repayLoan";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [repayAmountUSD, loanId]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareCancelLendingRequestPayload(
    requestId: number
): string {
    const command = "cancelLendingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [requestId]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareCancelBorrowingRequestPayload(
    requestId: number
): string {
    const command = "cancelBorrowingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [requestId]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareLiquidateLoanPayload(
    loanId: number
): string {
    const command = "liquidateLoan";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [loanId]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

// Exported API version of prepareLendingRequestPayload
export async function api_prepareLendingRequestPayload(
    user: xrpl.Wallet,
    
    minCollateralRatio: number,
    liquidationThreshold: number,
    desiredInterestRate: number,
    paymentDuration: number,
    minimalPartialFill: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareLendingRequestPayload(
        minCollateralRatio,
        liquidationThreshold,
        desiredInterestRate,
        paymentDuration,
        minimalPartialFill
    );
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

// Exported API version of prepareBorrowingRequestPayload
export async function api_prepareBorrowingRequestPayload(
    user: xrpl.Wallet,
    
    amountToBorrowUSD: number,
    maxCollateralRatio: number,
    liquidationThreshold: number,
    desiredInterestRate: number,
    paymentDuration: number,
    minimalPartialFill: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareBorrowingRequestPayload(
        amountToBorrowUSD,
        maxCollateralRatio,
        liquidationThreshold,
        desiredInterestRate,
        paymentDuration,
        minimalPartialFill
    );
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

// Exported API version of prepareAcceptLendingRequestPayload
export async function api_prepareAcceptLendingRequestPayload(
    user: xrpl.Wallet,
    
    requestId: number,
    borrowAmountUSD: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareAcceptLendingRequestPayload(requestId, borrowAmountUSD);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

// Exported API version of prepareAcceptBorrowingRequestPayload
export async function api_prepareAcceptBorrowingRequestPayload(
    user: xrpl.Wallet,
    
    requestId: number,
    collateralAmountXRP: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareAcceptBorrowingRequestPayload(requestId, collateralAmountXRP);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

// Exported API version of prepareRepayLoanPayload
export async function api_prepareRepayLoanPayload(
    user: xrpl.Wallet,
    
    repayAmountUSD: number,
    loanId: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareRepayLoanPayload(repayAmountUSD, loanId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

// Exported API version of prepareCancelLendingRequestPayload
export async function api_prepareCancelLendingRequestPayload(
    user: xrpl.Wallet,
    
    requestId: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareCancelLendingRequestPayload(requestId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

// Exported API version of prepareCancelBorrowingRequestPayload
export async function api_prepareCancelBorrowingRequestPayload(
    user: xrpl.Wallet,
    
    requestId: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareCancelBorrowingRequestPayload(requestId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

// Exported API version of prepareLiquidateLoanPayload
export async function api_prepareLiquidateLoanPayload(
    user: xrpl.Wallet,
    
    loanId: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareLiquidateLoanPayload(loanId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}