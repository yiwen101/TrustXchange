import { ethers } from 'ethers';
import * as xrpl from 'xrpl';
import { gmp_and_call_backend } from '../common/gmpUtil';
import {XRP_LENDING_POOL} from '../../const';
const contractAddress = XRP_LENDING_POOL;

function prepareLendPayload(): string {
    const command = "contribute";
    const params = ethers.AbiCoder.defaultAbiCoder().encode([], []);
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareWithdrawPayload(withdrawAmount: number): string {
    const command = "withdraw";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [withdrawAmount]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareClaimRewardPayload(): string {
   const command = "claimReward";
   const params = ethers.AbiCoder.defaultAbiCoder().encode([], []);
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareBorrowPayload(borrowAmountUSD: number): string {
    const command = "borrow";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [borrowAmountUSD]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}


function prepareRepayLoanPayload(loanId: number): string {
    const command = "repayLoan";
      const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [loanId]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareLiquidateLoanPayload(loanId: number): string {
    const command = "liquidateLoan";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [loanId]
    );
     return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}


// Exported API functions

export async function contribute(
    user: xrpl.Wallet,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareLendPayload();
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function withdraw(
    user: xrpl.Wallet,
    withdrawAmount: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareWithdrawPayload(withdrawAmount);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function claimReward(
    user: xrpl.Wallet,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareClaimRewardPayload();
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function borrow(
    user: xrpl.Wallet,
    borrowAmountUSD: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareBorrowPayload(borrowAmountUSD);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function repayLoan(
    user: xrpl.Wallet,
    loanId: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareRepayLoanPayload(loanId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function liquidateLoan(
    user: xrpl.Wallet,
    loanId: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareLiquidateLoanPayload(loanId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}