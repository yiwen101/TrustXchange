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

export interface PoolLendingBorrowerEvents {
    transactionHash: string;
    transactionUrl: string;
    eventName: string;
    amount: number;
    borrowerAddress: string;
    createdAt: string;
}
export interface PoolLendingContributor {
    address: string;
    contributionBalance: number;
    rewardDebt: number;
    confirmedRewards: number;
    createdAt: string;
    updatedAt: string;
}

export interface PoolLendingContributorEvents {
    transactionHash: string;
    transactionUrl: string;
    eventName: string;
    amount: number;
    contributorAddress: string;
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