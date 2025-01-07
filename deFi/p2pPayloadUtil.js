import { ethers } from 'ethers';
import * as utils from './utils.js';


const keccak256 = ethers.keccak256;
const toUtf8Bytes = ethers.toUtf8Bytes;
const contractAddress = process.env.XRP_LENDING_P2P;

const SELECTOR_LENDING_REQUEST = keccak256(toUtf8Bytes("createLendingRequest"));
const SELECTOR_BORROWING_REQUEST = keccak256(toUtf8Bytes("createBorrowingRequest"));
const SELECTOR_ACCEPT_LENDING_REQUEST = keccak256(toUtf8Bytes("acceptLendingRequest"));
const SELECTOR_ACCEPT_BORROWING_REQUEST = keccak256(toUtf8Bytes("acceptBorrowingRequest"));
const SELECTOR_REPAY_LOAN = keccak256(toUtf8Bytes("repayLoan"));

const SELECTOR_CANCEL_LENDING_REQUEST = keccak256(toUtf8Bytes("cancelLendingRequest"));
const SELECTOR_CANCEL_BORROWING_REQUEST = keccak256(toUtf8Bytes("cancelBorrowingRequest"));
const SELECTOR_LIQUIDATE_LOAN = keccak256(toUtf8Bytes("liquidateLoan"));

function prepareLendingRequestPayload(
    minCollateralRatio,
    liquidationThreshold,
    desiredInterestRate,
    paymentDuration,
    minimalPartialFill
    ) {
    const command = "createLendingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256"],
        [minCollateralRatio, liquidationThreshold, desiredInterestRate, paymentDuration, minimalPartialFill]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}


function prepareBorrowingRequestPayload(
    amountToBorrowUSD,
    maxCollateralRatio,
    liquidationThreshold,
    desiredInterestRate,
    paymentDuration,
    minimalPartialFill
) {
    const command = "createBorrowingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
        [amountToBorrowUSD, maxCollateralRatio, liquidationThreshold, desiredInterestRate, paymentDuration, minimalPartialFill]
    );
     return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareAcceptLendingRequestPayload(requestId, borrowAmountUSD) {
    const command = "acceptLendingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [requestId, borrowAmountUSD]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareAcceptBorrowingRequestPayload(requestId, collateralAmountXRP) {
    const command = "acceptBorrowingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [requestId, collateralAmountXRP]
    );
   return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}


function prepareRepayLoanPayload(repayAmountUSD, loanId) {
    const command = "repayLoan";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256"],
        [repayAmountUSD, loanId]
    );
     return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}


function prepareCancelLendingRequestPayload(requestId) {
    const command = "cancelLendingRequest";
    const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [requestId]
    );
    return ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes"], [command, params]);
}

function prepareCancelBorrowingRequestPayload(requestId) {
    const command = "cancelBorrowingRequest";
        const params = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [requestId]
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

function getP2PLendingRequestGMPParams() {
    const minCollateralRatio = 150;
    const liquidationThreshold = 110;
    const desiredInterestRate = 10;
    const paymentDuration = 30;
    const minimalPartialFill = 99;
    const payloadBytes = prepareLendingRequestPayload(
        minCollateralRatio,
        liquidationThreshold,
        desiredInterestRate,
        paymentDuration,
        minimalPartialFill
    );
    const input = utils.getGMPInputs(contractAddress,payloadBytes,"USD", 1000);
    return input;
}

function getP2PBorrowingRequestGMPParams(duration = 30) {
    const amountToBorrowUSD = 1000;
    const maxCollateralRatio = 200;
    const liquidationThreshold = 110;
    const desiredInterestRate = 10;
    const minimalPartialFill = 100;
    const payloadBytes = prepareBorrowingRequestPayload(
        amountToBorrowUSD,
        maxCollateralRatio,
        liquidationThreshold,
        desiredInterestRate,
        duration,
        minimalPartialFill
    );
    const input = utils.getGMPInputs(contractAddress,payloadBytes,"XRP", 1000);
    return input;
}

function getP2PAcceptLendingRequestGMPParams() {
    const requestId = 1;
    const borrowAmountUSD = 1000;
    const payloadBytes = prepareAcceptLendingRequestPayload(requestId, borrowAmountUSD);
    const input = utils.getGMPInputs(contractAddress,payloadBytes,"XRP", 1000);
    return input;
}

function getP2PAcceptBorrowingRequestGMPParams() {
    const requestId = 1;
    const collateralAmountXRP = 1000;
    const payloadBytes = prepareAcceptBorrowingRequestPayload(requestId, collateralAmountXRP);
    const input = utils.getGMPInputs(contractAddress,payloadBytes,"USD", 1000);
    return input;
}

function getP2PRepayLoanGMPParams() {
    const repayAmountUSD = 1000;
    const loanId = 1;
    const payloadBytes = prepareRepayLoanPayload(repayAmountUSD, loanId);
    const input = utils.getGMPInputs(contractAddress,payloadBytes,"USD", 1000);
    return input;
}


// Export the selectors to enable checks when calling the functions
export {
    SELECTOR_LENDING_REQUEST,
    SELECTOR_BORROWING_REQUEST,
    SELECTOR_ACCEPT_LENDING_REQUEST,
    SELECTOR_ACCEPT_BORROWING_REQUEST,
    SELECTOR_REPAY_LOAN,
    SELECTOR_CANCEL_LENDING_REQUEST,
    SELECTOR_CANCEL_BORROWING_REQUEST,
    SELECTOR_LIQUIDATE_LOAN,
    prepareLendingRequestPayload,
    prepareBorrowingRequestPayload,
    prepareAcceptLendingRequestPayload,
    prepareAcceptBorrowingRequestPayload,
    prepareRepayLoanPayload,
    prepareCancelLendingRequestPayload,
    prepareCancelBorrowingRequestPayload,
    prepareLiquidateLoanPayload,
    getP2PLendingRequestGMPParams,
    getP2PBorrowingRequestGMPParams,
    getP2PAcceptLendingRequestGMPParams,
    getP2PAcceptBorrowingRequestGMPParams,
    getP2PRepayLoanGMPParams
}