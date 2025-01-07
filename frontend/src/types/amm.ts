export interface AMMInfo {
    usd_amount: number;
    xrp_amount: number;
    full_trading_fee: number;
    lp_token: {
        currency: string;
        issuer: string;
        value: string;
    }
}

export interface PoolStats {
    totalXrp: number;
    totalUsd: number;
    apr: number;
    volume24h: number;
}

export interface UserStats {
    userXrp: number;
    userUsd: number;
    sharePercentage: number;
}

export interface TransactionResult {
    success: boolean;
    hash?: string;
    error?: string;
}

export interface PoolTransaction extends TransactionResult {
    lpTokens?: string;
    sharePercentage?: number;
}

export interface MinReceiveAmounts {
    xrp: string;
    usd: string;
} 