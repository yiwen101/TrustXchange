export interface PoolLendingBorrower {
    borrowerAddress: string;
    borrowAmountUsd: number;
    amountPayableUsd: number;
    collateralAmountXrp: number;
    lastPayableUpdateTime: string;
    repaidUsd: number;
    createdAt: string;
    updatedAt: string;
}

export interface PoolLendingContributor {
    address: string;
    contributionBalance: number;
    rewardDebt: number;
    confirmedRewards: number;
    createdAt: string;
    updatedAt: string;
}

export interface PoolLendingUserEvents {
    transactionHash: string;
    transactionUrl: string;
    eventName: string;
    type: string;
    amount: number;
    userAddress: string;
    createdAt: string;
}

export interface PoolLendingPoolEvents {
    transactionHash: string;
    transactionUrl: string;
    rewardDistributed: number;
    accRewardPerShareE18: number;
    equity: number;
    retainedEarning: number;
    createdAt: string;
}