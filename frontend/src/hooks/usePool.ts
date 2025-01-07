import { useState, useCallback, useEffect } from 'react';
import { useConnectedWallet } from './useConnectedWallet';
import { useXrpPriceValue } from './usePriceState';
import { add_xrp_to_XRP_USDC_AMM, add_usd_to_XRP_USDC_AMM, get_user_amm_share, remove_liquidity_from_XRP_USDC_AMM, add_liquidity_to_AMM, get_user_pool_share, get_wallet_balance } from '../api/xrp/amm_transection';
import { AMMInfo, PoolStats, UserStats } from '../types/amm';

interface PoolState {
    xrpAmount: string;
    usdAmount: string;
    isLoading: boolean;
    error: string | null;
    success: boolean;
    lpTokens: string;
}

export function usePool() {
    const [state, setState] = useState<PoolState>({
        xrpAmount: '',
        usdAmount: '',
        isLoading: false,
        error: null,
        success: false,
        lpTokens: '0'
    });

    const { wallet } = useConnectedWallet();
    const { ammInfo } = useXrpPriceValue();
    const [userStats, setUserStats] = useState<UserStats | null>(null);

    // 获取用户池子信息
    useEffect(() => {
        const fetchUserStats = async () => {
            if (!wallet || !ammInfo) return;
            try {
                const poolShare = await get_user_pool_share(wallet);
                setUserStats({
                    userXrp: poolShare.xrpAmount,
                    userUsd: poolShare.usdAmount,
                    sharePercentage: poolShare.poolShare,
                    lpTokens: poolShare.lpTokens
                });
            } catch (error) {
                console.error('Failed to get user stats:', error);
            }
        };
        
        fetchUserStats();
    }, [wallet, ammInfo]);

    // 添加最小接收金额保护
    const MIN_SLIPPAGE = 0.99; // 99%
    
    // 添加余额验证
    const validateBalance = async (xrpAmount: string, usdAmount: string): Promise<boolean> => {
        if (!wallet) return false;
        try {
            const balance = await get_wallet_balance(wallet);
            return Number(xrpAmount) <= balance.xrp && 
                   Number(usdAmount) <= balance.usdc;
        } catch (error) {
            console.error('Failed to validate balance:', error);
            return false;
        }
    };

    // 添加流动性
    const addLiquidity = async (xrpAmount: string, usdAmount: string) => {
        if (!wallet || !ammInfo) return;

        try {
            // 添加余额检查
            const hasBalance = await validateBalance(xrpAmount, usdAmount);
            if (!hasBalance) {
                setState(prev => ({
                    ...prev,
                    error: 'Insufficient balance'
                }));
                return;
            }

            setState(prev => ({ ...prev, isLoading: true, error: null }));
            
            const result = await add_liquidity_to_AMM(
                wallet,
                Number(xrpAmount),
                Number(usdAmount)
            );

            // 更新用户状态
            const poolShare = await get_user_pool_share(wallet);
            setUserStats({
                userXrp: poolShare.xrpAmount,
                userUsd: poolShare.usdAmount,
                sharePercentage: poolShare.poolShare,
                lpTokens: poolShare.lpTokens
            });

            setState(prev => ({
                ...prev,
                success: true,
                xrpAmount: '',
                usdAmount: '',
                lpTokens: result.lpTokens
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to add liquidity'
            }));
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    // 移除流动性
    const removeLiquidity = async (lpTokenAmount: string) => {
        if (!wallet || !ammInfo) return;

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            await remove_liquidity_from_XRP_USDC_AMM(wallet, lpTokenAmount);
            
            // 更新用户状态
            const poolShare = await get_user_pool_share(wallet);
            setUserStats({
                userXrp: poolShare.xrpAmount,
                userUsd: poolShare.usdAmount,
                sharePercentage: poolShare.poolShare,
                lpTokens: poolShare.lpTokens
            });

            setState(prev => ({ ...prev, success: true }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to remove liquidity'
            }));
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const getPoolStats = useCallback((): PoolStats | null => {
        if (!ammInfo) return null;

        return {
            totalXrp: ammInfo.xrp_amount,
            totalUsd: ammInfo.usd_amount,
            apr: calculateAPR(ammInfo),
            volume24h: calculate24hVolume(ammInfo)
        };
    }, [ammInfo]);

    const getUserStats = useCallback(async () => {
        if (!wallet || !ammInfo) return null;

        try {
            const poolShare = await get_user_pool_share(wallet);
            return {
                userXrp: poolShare.xrpAmount,
                userUsd: poolShare.usdAmount,
                sharePercentage: poolShare.poolShare,
                lpTokens: poolShare.lpTokens
            };
        } catch (error) {
            console.error('Failed to get user stats:', error);
            return null;
        }
    }, [wallet, ammInfo]);

    const calculateAPR = (ammInfo: AMMInfo): number => {
        // 这里需要实现 APR 计算逻辑
        // 可以基于交易量、手续费等
        return 0.05; // 示例：5% APR
    };

    const calculate24hVolume = (ammInfo: AMMInfo): number => {
        // 这里需要实现 24h 交易量计算逻辑
        return 100000; // 示例值
    };

    const calculateUserShare = (totalAmount: number): number => {
        // 这里需要实现用户份额计算逻辑
        if (!wallet || !ammInfo) return 0;
        
        // 基于用户的 LP 代币数量计算份额
        return totalAmount * 0.1; // 示例：用户占 10%
    };

    const calculateSharePercentage = (): number => {
        if (!wallet || !ammInfo) return 0;
        
        // 计算用户在池子中的份额百分比
        return 0.1; // 示例：10%
    };

    const handleXrpAmountChange = useCallback((value: string) => {
        if (!ammInfo) return;

        const max_tradable_usd = ammInfo.usd_amount - 10;
        const max_tradable_xrp = ammInfo.xrp_amount - 10;
        const xrp_amount = parseFloat(value);

        if (xrp_amount > max_tradable_xrp) {
            setState(prev => ({
                ...prev,
                xrpAmount: max_tradable_xrp.toFixed(2),
                usdAmount: (max_tradable_xrp * ammInfo.usd_amount / ammInfo.xrp_amount).toFixed(2)
            }));
            return;
        }

        setState(prev => ({
            ...prev,
            xrpAmount: value,
            usdAmount: (xrp_amount * ammInfo.usd_amount / ammInfo.xrp_amount).toFixed(2)
        }));
    }, [ammInfo]);

    const handleUsdAmountChange = useCallback((value: string) => {
        if (!ammInfo) return;

        const max_tradable_usd = ammInfo.usd_amount - 10;
        const max_tradable_xrp = ammInfo.xrp_amount - 10;
        const usd_amount = parseFloat(value);

        if (usd_amount > max_tradable_usd) {
            setState(prev => ({
                ...prev,
                usdAmount: max_tradable_usd.toFixed(2),
                xrpAmount: (max_tradable_usd * ammInfo.xrp_amount / ammInfo.usd_amount).toFixed(2)
            }));
            return;
        }

        setState(prev => ({
            ...prev,
            usdAmount: value,
            xrpAmount: (usd_amount * ammInfo.xrp_amount / ammInfo.usd_amount).toFixed(2)
        }));
    }, [ammInfo]);

    return {
        ...state,
        addLiquidity,
        removeLiquidity,
        poolStats: getPoolStats(),
        userStats,
        isLoading: state.isLoading,
        handleXrpAmountChange,
        handleUsdAmountChange
    };
} 