export interface P2pBorrowingRequest {
    requestId: number;
    borrower: string;
    amountToBorrowUsd: number;
    amountBorrowedUsd: number;
    initialCollateralAmountXrp: number;
    existingCollateralAmountXrp: number;
    maxCollateralRatio: number;
    liquidationThreshold: number;
    desiredInterestRate: number;
    paymentDuration: number;
    minimalPartialFill: number;
    canceled: boolean;
    canceledBySystem: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface P2pBorrowingRequestEvent {
    transactionHash: string;
    transactionUrl: string;
    eventName: string;
    requestId: number;
    createdAt: string;
}

export interface P2pLendingRequest {
    requestId: number;
    lender: string;
    amountToLendUsd: number;
    amountLendedUsd: number;
    minCollateralRatio: number;
    liquidationThreshold: number;
    desiredInterestRate: number;
    paymentDuration: number;
    minimalPartialFill: number;
    canceled: boolean;
    canceledBySystem: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface P2pLendingRequestEvent {
    transactionHash: string;
    transactionUrl: string;
    eventName: string;
    requestId: number;
    createdAt: string;
}

export interface P2pLoan {
    loanId: number;
    lender: string;
    borrower: string;
    amountBorrowedUsd: number;
    amountPayableToLender: number;
    amountPayableToPlatform: number;
    amountPaidUsd: number;
    collateralAmountXrp: number;
    repayBy: string;
    liquidationThreshold: number;
    isLiquidated: boolean;
    lendRequestId: number;
    borrowRequestId: number;
    createdAt: string;
    updatedAt: string;
}

export interface P2pLoanEvent {
    transactionHash: string;
    transactionUrl: string;
    eventName: string;
    amount: number;
    loanId: number;
    createdAt: string;
}