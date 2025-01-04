import { ethers } from 'ethers';
import dotenv from "dotenv";
dotenv.config();

// 1. Replace with your contract's address
const contractAddress = process.env.XRP_LENDING_P2P;

// 2. Replace with your contract's ABI as string
const contractABI = `
   [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "gateway_",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "priceOracle_",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "InvalidAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotApprovedByGateway",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "BorrowingRequestAutoCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "canceller",
          "type": "string"
        }
      ],
      "name": "BorrowingRequestCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "borrower",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountToBorrowUSD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralAmountXRP",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "maxCollateralRatio",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "liquidationThreshold",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "desiredInterestRate",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "paymentDuration",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minimalPartialFill",
          "type": "uint256"
        }
      ],
      "name": "BorrowingRequestCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "LendingRequestAutoCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "canceller",
          "type": "string"
        }
      ],
      "name": "LendingRequestCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "lender",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountToLendUSD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minCollateralRatio",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "liquidationThreshold",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "desiredInterestRate",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "paymentDuration",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minimalPartialFill",
          "type": "uint256"
        }
      ],
      "name": "LendingRequestCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "loanId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "lender",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "borrower",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountBorrowedUSD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralAmountXRP",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountPayableToLender",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountPayableToPlatform",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "repayBy",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "liquidationThreshold",
          "type": "uint256"
        }
      ],
      "name": "LoanCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "loanId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "liquidator",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralLiquidated",
          "type": "uint256"
        }
      ],
      "name": "LoanLiquidated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "loanId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountRepaid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalPaid",
          "type": "uint256"
        }
      ],
      "name": "LoanRepaid",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "loanId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "borrower",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newAmountBorrowedUSD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newCollateralAmountXRP",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newAmountPayableToLender",
          "type": "uint256"
        }
      ],
      "name": "LoanUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newPrice",
          "type": "uint256"
        }
      ],
      "name": "PriceUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountFilled",
          "type": "uint256"
        }
      ],
      "name": "RequestFilled",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "PLATFORM_FEE_PERCENT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_ACCEPT_BORROWING_REQUEST",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_ACCEPT_LENDING_REQUEST",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_BORROWING_REQUEST",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_CANCEL_BORROWING_REQUEST",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_CANCEL_LENDING_REQUEST",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_LENDING_REQUEST",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_LIQUIDATE_LOAN",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SELECTOR_REPAY_LOAN",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SUPPORTED_SOURCE_CHAIN_HASH",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "borrowingRequests",
      "outputs": [
        {
          "internalType": "string",
          "name": "borrower",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amountToBorrowUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountBorrowedUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "initialCollateralAmountXRP",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "existingCollateralAmountXRP",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxCollateralRatio",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidationThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "desiredInterestRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "paymentDuration",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimalPartialFill",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "canceled",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentXRPPriceUSD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "commandId",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "sourceChain",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "sourceAddress",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "payload",
          "type": "bytes"
        }
      ],
      "name": "execute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "commandId",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "sourceChain",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "sourceAddress",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "payload",
          "type": "bytes"
        },
        {
          "internalType": "string",
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "executeWithToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gateway",
      "outputs": [
        {
          "internalType": "contract IMyAxelarGateway",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_requestId",
          "type": "uint256"
        }
      ],
      "name": "getBorrowingRequest",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "borrower",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amountToBorrowUSD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountBorrowedUSD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "initialCollateralAmountXRP",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "existingCollateralAmountXRP",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxCollateralRatio",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "liquidationThreshold",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "desiredInterestRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "paymentDuration",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minimalPartialFill",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "canceled",
              "type": "bool"
            }
          ],
          "internalType": "struct XrpLendingP2P.BorrowingRequest",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_requestId",
          "type": "uint256"
        }
      ],
      "name": "getLendingRequest",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "lender",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amountToLendUSD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountLendedUSD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minCollateralRatio",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "liquidationThreshold",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "desiredInterestRate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "paymentDuration",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minimalPartialFill",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "canceled",
              "type": "bool"
            }
          ],
          "internalType": "struct XrpLendingP2P.LendingRequest",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_loanId",
          "type": "uint256"
        }
      ],
      "name": "getLoanDetails",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "lender",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "borrower",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amountBorrowedUSD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountPayableToLender",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountPayableToPlatform",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountPaidUSD",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "collateralAmountXRP",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "repayBy",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "liquidationThreshold",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isLiquidated",
              "type": "bool"
            }
          ],
          "internalType": "struct XrpLendingP2P.Loan",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_user",
          "type": "string"
        }
      ],
      "name": "getUserBorrowingRequests",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_user",
          "type": "string"
        }
      ],
      "name": "getUserLendingRequests",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_user",
          "type": "string"
        }
      ],
      "name": "getUserLoans",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lastPriceUpdateTimestamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "lendingRequests",
      "outputs": [
        {
          "internalType": "string",
          "name": "lender",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amountToLendUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountLendedUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minCollateralRatio",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidationThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "desiredInterestRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "paymentDuration",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimalPartialFill",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "canceled",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "loanCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "loans",
      "outputs": [
        {
          "internalType": "string",
          "name": "lender",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "borrower",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amountBorrowedUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountPayableToLender",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountPayableToPlatform",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountPaidUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "collateralAmountXRP",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "repayBy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidationThreshold",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isLiquidated",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "oracleUpdater",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requestCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newPrice",
          "type": "uint256"
        }
      ],
      "name": "setPriceOracle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "supportedSourceChain",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userBorrowingRequests",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userLendingRequests",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userLoans",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
`;


// 3. Initialize provider
const provider = new ethers.JsonRpcProvider("https://rpc-evm-sidechain.xrpl.org");


// 4. Create an Interface
const iface = new ethers.Interface(contractABI);

// 5. Get transaction receipt
async function decodeAllLogs (transactionHash) {
    const transactionReceipt = await provider.getTransactionReceipt(transactionHash);

    if (!transactionReceipt) {
        console.error("Transaction receipt not found");
        return;
    }

    // Loop through logs
    for (const log of transactionReceipt.logs) {
        try {
            //Parse the log
            const parsedLog = iface.parseLog(log);
             if (parsedLog) {
              console.log("Parsed Event:", parsedLog);
             } else {
                 console.log("Not a Parsable Log:", log);
             }

        } catch (e) {
          // console.error("Error parsing log:", e);
          console.log("Not a parsable log:", log)
        }
    }
}


// replace with your transaction hash
const transactionHash = "0xae46baeeafef70bf23ed7344981140110093603dad362dc8a6bdae388c7985ef";
decodeAllLogs(transactionHash);