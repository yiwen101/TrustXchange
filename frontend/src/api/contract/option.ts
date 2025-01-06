import { ethers } from 'ethers';
import * as xrpl from 'xrpl';
import { gmp_and_call_backend } from '../common/gmpUtil';
import {OPTION_TRADING} from '../../const';
const contractAddress = OPTION_TRADING;

const AbiCoder = ethers.AbiCoder.defaultAbiCoder();

function prepareSellCallOptionPayload(strikePrice: number, expiryWeeks: number, price: number, amount: number): string {
    const command = "sellCallOption";
    const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareSellPutOptionPayload(strikePrice: number, expiryWeeks: number, price: number, amount: number): string {
    const command = "sellPutOption";
    const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
     return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareBuyCallOptionPayload(strikePrice: number, expiryWeeks: number, price: number, amount: number): string {
    const command = "buyCallOption";
      const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareBuyPutOptionPayload(strikePrice: number, expiryWeeks: number, price: number, amount: number): string {
    const command = "buyPutOption";
    const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}


function prepareCancelSellCallOptionOrderPayload(orderId: number): string {
    const command = "cancelSellCallOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareCancelSellPutOptionOrderPayload(orderId: number): string {
    const command = "cancelSellPutOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareCancelBuyCallOptionOrderPayload(orderId: number): string {
    const command = "cancelBuyCallOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareCancelBuyPutOptionOrderPayload(orderId: number): string {
      const command = "cancelBuyPutOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
   return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareIssueCallOptionPayload(strikePrice: number, expiryWeeks: number): string {
    const command = "issueCallOption";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
   return AbiCoder.encode(["string", "bytes"], [command, params]);
}


function prepareIssuePutOptionPayload(strikePrice: number, expiryWeeks: number): string {
    const command = "issuePutOption";
      const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
     return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareExerciseCallOptionPayload(strikePrice: number, expiryWeeks: number): string {
    const command = "exerciseCallOption";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
   return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareExercisePutOptionPayload(strikePrice: number, expiryWeeks: number): string {
    const command = "exercisePutOption";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareWithdrawCallOptionCollateralPayload(strikePrice: number, expiryWeeks: number): string {
    const command = "withdrawCallOptionCollateral";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
      return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareWithdrawPutOptionCollateralPayload(strikePrice: number, expiryWeeks: number): string {
     const command = "withdrawPutOptionCollateral";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

// Exported API functions

export async function sellCallOption(
    user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
    price: number,
    amount: number,
    currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareSellCallOptionPayload(strikePrice, expiryWeeks, price, amount);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}


export async function sellPutOption(
    user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
    price: number,
    amount: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareSellPutOptionPayload(strikePrice, expiryWeeks, price, amount);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function buyCallOption(
    user: xrpl.Wallet,
      strikePrice: number,
    expiryWeeks: number,
    price: number,
    amount: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareBuyCallOptionPayload(strikePrice, expiryWeeks, price, amount);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function buyPutOption(
    user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
    price: number,
    amount: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareBuyPutOptionPayload(strikePrice, expiryWeeks, price, amount);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}
export async function cancelSellCallOptionOrder(
    user: xrpl.Wallet,
    orderId: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareCancelSellCallOptionOrderPayload(orderId);
     await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function cancelSellPutOptionOrder(
    user: xrpl.Wallet,
    orderId: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareCancelSellPutOptionOrderPayload(orderId);
   await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function cancelBuyCallOptionOrder(
    user: xrpl.Wallet,
    orderId: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareCancelBuyCallOptionOrderPayload(orderId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function cancelBuyPutOptionOrder(
    user: xrpl.Wallet,
    orderId: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareCancelBuyPutOptionOrderPayload(orderId);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function issueCallOption(
     user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareIssueCallOptionPayload(strikePrice, expiryWeeks);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}


export async function issuePutOption(
    user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareIssuePutOptionPayload(strikePrice, expiryWeeks);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function exerciseCallOption(
     user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareExerciseCallOptionPayload(strikePrice, expiryWeeks);
     await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function exercisePutOption(
    user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
     const payloadStr = prepareExercisePutOptionPayload(strikePrice, expiryWeeks);
    await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}

export async function withdrawCallOptionCollateral(
    user: xrpl.Wallet,
    strikePrice: number,
    expiryWeeks: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
    const payloadStr = prepareWithdrawCallOptionCollateralPayload(strikePrice, expiryWeeks);
     await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}


export async function withdrawPutOptionCollateral(
    user: xrpl.Wallet,
      strikePrice: number,
    expiryWeeks: number,
     currencyAmount: xrpl.IssuedCurrencyAmount | string
): Promise<void> {
     const payloadStr = prepareWithdrawPutOptionCollateralPayload(strikePrice, expiryWeeks);
     await gmp_and_call_backend(user, contractAddress, payloadStr, currencyAmount);
}