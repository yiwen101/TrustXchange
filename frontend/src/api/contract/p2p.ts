import { ethers } from 'ethers';
import * as xrpl from 'xrpl';
import { gmp_and_call_backend } from '../common/gmpUtil';
import {XRP_LENDING_P2P} from '../../const';
const contractAddress = XRP_LENDING_P2P;


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

export async function createLendRequest(
    user: xrpl.Wallet,
    
    minCollateralRatio: number,
    liquidationThreshold: number,
    desiredInterestRate: number,
    paymentDuration: number,
    minimalPartialFill: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string,
    beforeCallBackend?: undefined | ((response: string) => void),
    afterCallBackend?: undefined | ((response: string) => void),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareLendingRequestPayload(
        minCollateralRatio,
        liquidationThreshold,
        desiredInterestRate,
        paymentDuration,
        minimalPartialFill,
    );
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount, beforeCallBackend, afterCallBackend, middleCallBackend);
}

export async function createBorrowRequest(
    user: xrpl.Wallet,
    
    amountToBorrowUSD: number,
    maxCollateralRatio: number,
    liquidationThreshold: number,
    desiredInterestRate: number,
    paymentDuration: number,
    minimalPartialFill: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string,
    beforeCallBackend?: undefined | ((response: string) => void), 
    afterCallBackend?: undefined | ((response: string) => void ),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareBorrowingRequestPayload(
        amountToBorrowUSD,
        maxCollateralRatio,
        liquidationThreshold,
        desiredInterestRate,
        paymentDuration,
        minimalPartialFill
    );
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount, beforeCallBackend, afterCallBackend, middleCallBackend);
}

export async function acceptLendRequest(
    user: xrpl.Wallet,
    
    requestId: number,
    borrowAmountUSD: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string,
    beforeCallBackend?: undefined | ((response: string) => void), 
    afterCallBackend?: undefined | ((response: string) => void ),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareAcceptLendingRequestPayload(requestId, borrowAmountUSD);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount, beforeCallBackend, afterCallBackend, middleCallBackend);
}

export async function acceptBorrowRequest(
    user: xrpl.Wallet,
    
    requestId: number,
    collateralAmountXRP: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string,
    beforeCallBackend?: undefined | ((response: string) => void),
    afterCallBackend?: undefined | ((response: string) => void),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareAcceptBorrowingRequestPayload(requestId, collateralAmountXRP);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount, beforeCallBackend, afterCallBackend, middleCallBackend);
}

export async function repayLoan(
    user: xrpl.Wallet,
    
    repayAmountUSD: number,
    loanId: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string,
    beforeCallBackend?: undefined | ((response: string) => void),
    afterCallBackend?: undefined | ((response: string) => void),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareRepayLoanPayload(repayAmountUSD, loanId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount, beforeCallBackend, afterCallBackend, middleCallBackend);
}

export async function cancelLendRequest(
    user: xrpl.Wallet,
    
    requestId: number,
    beforeCallBackend?: undefined | ((response: string) => void),
    afterCallBackend?: undefined | ((response: string) => void),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareCancelLendingRequestPayload(requestId);
    await gmp_and_call_backend(user, contractAddress, payloadStr,undefined, beforeCallBackend, afterCallBackend, middleCallBackend);
}

export async function cancelBorrowRequest(
    user: xrpl.Wallet,
    
    requestId: number,
    beforeCallBackend?: undefined | ((response: string) => void),
    afterCallBackend?: undefined | ((response: string) => void),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareCancelBorrowingRequestPayload(requestId);
    await gmp_and_call_backend(user, contractAddress, payloadStr,undefined, beforeCallBackend, afterCallBackend, middleCallBackend);
}

export async function liquidateLoan(
    user: xrpl.Wallet,
    
    loanId: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string,
    beforeCallBackend?: undefined | ((response: string) => void),
    afterCallBackend?: undefined | ((response: string) => void),
    middleCallBackend?: undefined | ((response: string) => void)
): Promise<void> {
    const payloadStr = prepareLiquidateLoanPayload(loanId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount, beforeCallBackend, afterCallBackend, middleCallBackend);
}