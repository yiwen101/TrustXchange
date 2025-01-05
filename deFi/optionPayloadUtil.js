import { ethers } from 'ethers';
import * as utils from './utils.js';

const keccak256 = ethers.keccak256;
const toUtf8Bytes = ethers.toUtf8Bytes;
const AbiCoder = ethers.AbiCoder.defaultAbiCoder();
const contractAddress = process.env.OPTION_TRADING;

// --- Command Identifiers ---
const BUY_CALL_OPTION = keccak256(toUtf8Bytes("buyCallOption"));
const BUY_PUT_OPTION = keccak256(toUtf8Bytes("buyPutOption"));
const ISSUE_CALL_OPTION = keccak256(toUtf8Bytes("issueCallOption"));
const ISSUE_PUT_OPTION = keccak256(toUtf8Bytes("issuePutOption"));
const EXERCISE_CALL_OPTION = keccak256(toUtf8Bytes("exerciseCallOption"));
const EXERCISE_PUT_OPTION = keccak256(toUtf8Bytes("exercisePutOption"));
const SELL_CALL_OPTION = keccak256(toUtf8Bytes("sellCallOption"));
const SELL_PUT_OPTION = keccak256(toUtf8Bytes("sellPutOption"));
const CANCEL_SELL_CALL_OPTION_ORDER = keccak256(toUtf8Bytes("cancelSellCallOptionOrder"));
const CANCEL_SELL_PUT_OPTION_ORDER = keccak256(toUtf8Bytes("cancelSellPutOptionOrder"));
const CANCEL_BUY_CALL_OPTION_ORDER = keccak256(toUtf8Bytes("cancelBuyCallOptionOrder"));
const CANCEL_BUY_PUT_OPTION_ORDER = keccak256(toUtf8Bytes("cancelBuyPutOptionOrder"));
const WITHDRAW_CALL_OPTION_COLLATERAL = keccak256(toUtf8Bytes("withdrawCallOptionCollateral"));
const WITHDRAW_PUT_OPTION_COLLATERAL = keccak256(toUtf8Bytes("withdrawPutOptionCollateral"));


// --- Helper Functions for Encoding Payloads ---
function prepareSellCallOptionPayload(strikePrice, expiryWeeks, price, amount) {
    const command = "sellCallOption";
    const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareSellPutOptionPayload(strikePrice, expiryWeeks, price, amount) {
    const command = "sellPutOption";
    const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
     return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareBuyCallOptionPayload(strikePrice, expiryWeeks, price, amount) {
    const command = "buyCallOption";
      const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareBuyPutOptionPayload(strikePrice, expiryWeeks, price, amount) {
    const command = "buyPutOption";
    const params = AbiCoder.encode(["uint256", "uint256", "uint256", "uint256"], [strikePrice, expiryWeeks, price, amount]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}


function prepareCancelSellCallOptionOrderPayload(orderId) {
    const command = "cancelSellCallOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareCancelSellPutOptionOrderPayload(orderId) {
    const command = "cancelSellPutOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareCancelBuyCallOptionOrderPayload(orderId) {
    const command = "cancelBuyCallOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareCancelBuyPutOptionOrderPayload(orderId) {
      const command = "cancelBuyPutOptionOrder";
    const params = AbiCoder.encode(["uint256"], [orderId]);
   return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareIssueCallOptionPayload(strikePrice, expiryWeeks) {
    const command = "issueCallOption";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
   return AbiCoder.encode(["string", "bytes"], [command, params]);
}


function prepareIssuePutOptionPayload(strikePrice, expiryWeeks) {
    const command = "issuePutOption";
      const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
     return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareExerciseCallOptionPayload(strikePrice, expiryWeeks) {
    const command = "exerciseCallOption";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
   return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareExercisePutOptionPayload(strikePrice, expiryWeeks) {
    const command = "exercisePutOption";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareWithdrawCallOptionCollateralPayload(strikePrice, expiryWeeks) {
    const command = "withdrawCallOptionCollateral";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
      return AbiCoder.encode(["string", "bytes"], [command, params]);
}

function prepareWithdrawPutOptionCollateralPayload(strikePrice, expiryWeeks) {
     const command = "withdrawPutOptionCollateral";
    const params = AbiCoder.encode(["uint256", "uint256"], [strikePrice, expiryWeeks]);
    return AbiCoder.encode(["string", "bytes"], [command, params]);
}

// --- GMP Parameter Generators ---
function getSellCallOptionGMPParams(strikePrice, expiryWeeks, price, amount) {
    const payloadBytes = prepareSellCallOptionPayload(strikePrice, expiryWeeks, price, amount);
    return utils.getGMPInputs(contractAddress, payloadBytes, "USD", amount);
}

function getSellPutOptionGMPParams(strikePrice, expiryWeeks, price, amount) {
    const payloadBytes = prepareSellPutOptionPayload(strikePrice, expiryWeeks, price, amount);
     return utils.getGMPInputs(contractAddress, payloadBytes, "USD", amount);
}

function getBuyCallOptionGMPParams(strikePrice, expiryWeeks, price, amount) {
    const payloadBytes = prepareBuyCallOptionPayload(strikePrice, expiryWeeks, price, amount);
     return utils.getGMPInputs(contractAddress, payloadBytes, "USD", price * amount);
}

function getBuyPutOptionGMPParams(strikePrice, expiryWeeks, price, amount) {
    const payloadBytes = prepareBuyPutOptionPayload(strikePrice, expiryWeeks, price, amount);
    return utils.getGMPInputs(contractAddress, payloadBytes, "USD", price * amount);
}


function getCancelSellCallOptionOrderGMPParams(orderId) {
    const payloadBytes = prepareCancelSellCallOptionOrderPayload(orderId);
   return utils.getGMPInputs(contractAddress, payloadBytes, "USD", 0);
}

function getCancelSellPutOptionOrderGMPParams(orderId) {
    const payloadBytes = prepareCancelSellPutOptionOrderPayload(orderId);
    return utils.getGMPInputs(contractAddress, payloadBytes, "USD", 0);
}

function getCancelBuyCallOptionOrderGMPParams(orderId) {
    const payloadBytes = prepareCancelBuyCallOptionOrderPayload(orderId);
    return utils.getGMPInputs(contractAddress, payloadBytes, "USD", 0);
}

function getCancelBuyPutOptionOrderGMPParams(orderId) {
    const payloadBytes = prepareCancelBuyPutOptionOrderPayload(orderId);
  return utils.getGMPInputs(contractAddress, payloadBytes, "USD", 0);
}

function getIssueCallOptionGMPParams(strikePrice, expiryWeeks, amount) {
    const payloadBytes = prepareIssueCallOptionPayload(strikePrice, expiryWeeks);
      return utils.getGMPInputs(contractAddress, payloadBytes, "XRP", amount);
}

function getIssuePutOptionGMPParams(strikePrice, expiryWeeks, amount) {
      const payloadBytes = prepareIssuePutOptionPayload(strikePrice, expiryWeeks);
        return utils.getGMPInputs(contractAddress, payloadBytes, "USD", amount);
}

function getExerciseCallOptionGMPParams(strikePrice, expiryWeeks, amount) {
    const payloadBytes = prepareExerciseCallOptionPayload(strikePrice, expiryWeeks);
    return utils.getGMPInputs(contractAddress, payloadBytes, "USD", amount);
}


function getExercisePutOptionGMPParams(strikePrice, expiryWeeks, amount) {
    const payloadBytes = prepareExercisePutOptionPayload(strikePrice, expiryWeeks);
    return utils.getGMPInputs(contractAddress, payloadBytes, "XRP", amount);
}

function getWithdrawCallOptionCollateralGMPParams(strikePrice, expiryWeeks) {
    const payloadBytes = prepareWithdrawCallOptionCollateralPayload(strikePrice, expiryWeeks);
    return utils.getGMPInputs(contractAddress, payloadBytes, "USD", 0);
}


function getWithdrawPutOptionCollateralGMPParams(strikePrice, expiryWeeks) {
     const payloadBytes = prepareWithdrawPutOptionCollateralPayload(strikePrice, expiryWeeks);
    return utils.getGMPInputs(contractAddress, payloadBytes, "USD", 0);
}



// --- Exported Functions and Selectors ---
export {
    BUY_CALL_OPTION,
    BUY_PUT_OPTION,
    ISSUE_CALL_OPTION,
    ISSUE_PUT_OPTION,
    EXERCISE_CALL_OPTION,
    EXERCISE_PUT_OPTION,
    SELL_CALL_OPTION,
    SELL_PUT_OPTION,
    CANCEL_SELL_CALL_OPTION_ORDER,
    CANCEL_SELL_PUT_OPTION_ORDER,
    CANCEL_BUY_CALL_OPTION_ORDER,
    CANCEL_BUY_PUT_OPTION_ORDER,
    WITHDRAW_CALL_OPTION_COLLATERAL,
    WITHDRAW_PUT_OPTION_COLLATERAL,
    
    prepareSellCallOptionPayload,
    prepareSellPutOptionPayload,
    prepareBuyCallOptionPayload,
    prepareBuyPutOptionPayload,
    prepareCancelSellCallOptionOrderPayload,
    prepareCancelSellPutOptionOrderPayload,
    prepareCancelBuyCallOptionOrderPayload,
    prepareCancelBuyPutOptionOrderPayload,
    prepareIssueCallOptionPayload,
    prepareIssuePutOptionPayload,
    prepareExerciseCallOptionPayload,
    prepareExercisePutOptionPayload,
    prepareWithdrawCallOptionCollateralPayload,
    prepareWithdrawPutOptionCollateralPayload,
    
    getSellCallOptionGMPParams,
    getSellPutOptionGMPParams,
    getBuyCallOptionGMPParams,
    getBuyPutOptionGMPParams,
    getCancelSellCallOptionOrderGMPParams,
    getCancelSellPutOptionOrderGMPParams,
    getCancelBuyCallOptionOrderGMPParams,
    getCancelBuyPutOptionOrderGMPParams,
    getIssueCallOptionGMPParams,
    getIssuePutOptionGMPParams,
    getExerciseCallOptionGMPParams,
    getExercisePutOptionGMPParams,
    getWithdrawCallOptionCollateralGMPParams,
    getWithdrawPutOptionCollateralGMPParams,
};