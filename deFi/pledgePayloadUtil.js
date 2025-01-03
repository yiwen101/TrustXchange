import { ethers } from 'ethers';
import * as utils from './utils.js';

const keccak256 = ethers.keccak256;
const toUtf8Bytes = ethers.toUtf8Bytes;
const contractAddress = process.env.XRP_LENDING_POOL;

// --- Selectors ---
const SELECTOR_LEND = keccak256(toUtf8Bytes("lend"));
const SELECTOR_WITHDRAW = keccak256(toUtf8Bytes("withdraw"));
const SELECTOR_CLAIM_REWARD = keccak256(toUtf8Bytes("claimReward"));
const SELECTOR_BORROW = keccak256(toUtf8Bytes("borrow"));
const SELECTOR_REPAY_LOAN = keccak256(toUtf8Bytes("repayLoan"));
const SELECTOR_LIQUIDATE_LOAN = keccak256(toUtf8Bytes("liquidateLoan"));

// --- Payload Preparation Functions ---

function prepareLendPayload() {
    const command = "contribute";
    const params = ethers.AbiCoder.defaultAbiCoder().encode([], []);
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareWithdrawPayload(withdrawAmount) {
    const command = "withdraw";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [withdrawAmount]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareClaimRewardPayload() {
   const command = "claimReward";
   const params = ethers.AbiCoder.defaultAbiCoder().encode([], []);
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareBorrowPayload(borrowAmountUSD) {
    const command = "borrow";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [borrowAmountUSD]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}


function prepareRepayLoanPayload(loanId) {
    const command = "repayLoan";
      const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [loanId]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareLiquidateLoanPayload(loanId) {
    const command = "liquidateLoan";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [loanId]
    );
     return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

// --- GMP Parameter Functions ---
function getLendGMPParams(amount) {
    const payloadBytes = prepareLendPayload();
    const input = utils.getGMPInputs(contractAddress, payloadBytes, "USD", amount);
    return input;
}

function getWithdrawGMPParams(amount) {
    const payloadBytes = prepareWithdrawPayload(amount);
    const input = utils.getGMPInputs(contractAddress, payloadBytes);
    return input;
}

function getClaimRewardGMPParams() {
    const payloadBytes = prepareClaimRewardPayload();
    const input = utils.getGMPInputs(contractAddress, payloadBytes);
    return input;
}

function getBorrowGMPParams(collateralAmount, borrowAmountUSD) {
    const payloadBytes = prepareBorrowPayload(borrowAmountUSD);
    const input = utils.getGMPInputs(contractAddress, payloadBytes, "XRP", collateralAmount);
    return input;
}

function getRepayLoanGMPParams(amount, loanId) {
  const payloadBytes = prepareRepayLoanPayload(loanId);
  const input = utils.getGMPInputs(contractAddress, payloadBytes, "USD", amount);
  return input;
}

function getLiquidateLoanGMPParams(loanId, usdAmount) {
    const payloadBytes = prepareLiquidateLoanPayload(loanId);
    const input = utils.getGMPInputs(contractAddress,payloadBytes, "USD", usdAmount);
     return input;
}

// --- Exports ---
export {
    SELECTOR_LEND,
    SELECTOR_WITHDRAW,
    SELECTOR_CLAIM_REWARD,
    SELECTOR_BORROW,
    SELECTOR_REPAY_LOAN,
    SELECTOR_LIQUIDATE_LOAN,
    
    prepareLendPayload,
    prepareWithdrawPayload,
    prepareClaimRewardPayload,
    prepareBorrowPayload,
    prepareRepayLoanPayload,
    prepareLiquidateLoanPayload,
    
    getLendGMPParams,
    getBorrowGMPParams,
    getRepayLoanGMPParams,
    getLiquidateLoanGMPParams
};