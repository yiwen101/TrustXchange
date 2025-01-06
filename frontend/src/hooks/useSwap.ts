import { useState, useCallback } from 'react';
import { useConnectedWallet } from './useConnectedWallet';
import { swap_usdc_for_XRP } from '../api/xrp/amm_transection';
import { useXrpPriceValue } from './usePriceState';
import xrp_api from '../api/xrp';
import { useSwapHistory } from './useSwapHistory';

interface SwapState {
    usdValue: string;
    xrpValue: string;
    isXrpToUsd: boolean;
    error: string | null;
    success: boolean;
    isSwapping: boolean;
    isLoading: boolean;
    showConfirmation: boolean;
}

export function useSwap() {
    const [state, setState] = useState<SwapState>({
        usdValue: '',
        xrpValue: '',
        isXrpToUsd: true,
        error: null,
        success: false,
        isSwapping: false,
        isLoading: false,
        showConfirmation: false
    });

    const { wallet } = useConnectedWallet();
    const { ammInfo } = useXrpPriceValue();
    const dp = 2; // 可以作为参数传入如果需要
    const { addToHistory } = useSwapHistory();

    const validateSwap = useCallback((usdAmount: number, xrpAmount: number) => {
        if (!wallet) {
            throw new Error('Please connect your wallet first');
        }
        if (!ammInfo) {
            throw new Error('AMM info not available');
        }

        const maxTradableUsd = ammInfo.usd_amount - 10;
        const maxTradableXrp = ammInfo.xrp_amount - 10;

        if (usdAmount > maxTradableUsd) {
            throw new Error(`USD amount exceeds maximum tradable amount (${maxTradableUsd})`);
        }
        if (xrpAmount > maxTradableXrp) {
            throw new Error(`XRP amount exceeds maximum tradable amount (${maxTradableXrp})`);
        }
    }, [wallet, ammInfo]);

    const handleXrpValueChange = useCallback((value: string) => {
        if (!ammInfo) return;

        const max_tradable_usd = ammInfo.usd_amount - 10;
        const max_tradable_xrp = ammInfo.xrp_amount - 10;
        const xrp_amount = parseFloat(value);

        setState(prev => {
            if (prev.isXrpToUsd) {
                const usd_can_get = xrp_api.get_usd_can_get_with_xrp(xrp_amount, ammInfo);
                if (usd_can_get.toNumber() > max_tradable_usd - 1) {
                    const xrp_required = xrp_api.get_xrp_needed_for_usd(max_tradable_usd, ammInfo);
                    return {
                        ...prev,
                        usdValue: max_tradable_usd.toFixed(dp),
                        xrpValue: xrp_required.toFixed(dp)
                    };
                }
                return {
                    ...prev,
                    usdValue: usd_can_get.toFixed(dp),
                    xrpValue: value
                };
            } else {
                if (xrp_amount > max_tradable_xrp - 1) {
                    const usd_needed = xrp_api.get_usd_needed_for_xrp(max_tradable_xrp, ammInfo);
                    return {
                        ...prev,
                        xrpValue: max_tradable_xrp.toFixed(dp),
                        usdValue: usd_needed.toFixed(dp)
                    };
                }
                const usd_needed = xrp_api.get_usd_needed_for_xrp(xrp_amount, ammInfo);
                return {
                    ...prev,
                    usdValue: usd_needed.toFixed(dp),
                    xrpValue: value
                };
            }
        });
    }, [ammInfo, dp]);

    const handleUsdValueChange = useCallback((value: string) => {
        if (!ammInfo) return;

        const max_tradable_usd = ammInfo.usd_amount - 10;
        const max_tradable_xrp = ammInfo.xrp_amount - 10;
        const usd_amount = parseFloat(value);

        setState(prev => {
            if (prev.isXrpToUsd) {
                if (usd_amount > max_tradable_usd) {
                    const xrp_required = xrp_api.get_xrp_needed_for_usd(max_tradable_usd, ammInfo);
                    return {
                        ...prev,
                        xrpValue: xrp_required.toFixed(dp),
                        usdValue: max_tradable_usd.toFixed(dp)
                    };
                }
                const xrp_required = xrp_api.get_xrp_needed_for_usd(usd_amount, ammInfo);
                return {
                    ...prev,
                    xrpValue: xrp_required.toFixed(dp),
                    usdValue: value
                };
            } else {
                const xrp_can_get = xrp_api.get_xrp_needed_for_usd(usd_amount, ammInfo);
                if (xrp_can_get.toNumber() > max_tradable_xrp) {
                    const usd_needed = xrp_api.get_usd_needed_for_xrp(max_tradable_xrp, ammInfo);
                    return {
                        ...prev,
                        xrpValue: max_tradable_xrp.toFixed(dp),
                        usdValue: usd_needed.toFixed(dp)
                    };
                }
                return {
                    ...prev,
                    xrpValue: xrp_can_get.toFixed(dp),
                    usdValue: value
                };
            }
        });
    }, [ammInfo, dp]);

    const handleSwitch = useCallback(() => {
        setState(prev => ({
            ...prev,
            isXrpToUsd: !prev.isXrpToUsd,
            usdValue: '',
            xrpValue: ''
        }));
    }, []);

    const executeSwap = async () => {
        try {
            const { usdValue, xrpValue } = state;
            if (!usdValue || !xrpValue) return;

            validateSwap(Number(usdValue), Number(xrpValue));
            
            setState(prev => ({ ...prev, isSwapping: true, error: null }));
            await swap_usdc_for_XRP(wallet!, Number(usdValue), Number(xrpValue));
            
            addToHistory({
                fromAmount: state.isXrpToUsd ? state.xrpValue : state.usdValue,
                fromCurrency: state.isXrpToUsd ? 'XRP' : 'USD',
                toAmount: state.isXrpToUsd ? state.usdValue : state.xrpValue,
                toCurrency: state.isXrpToUsd ? 'USD' : 'XRP',
                status: 'success'
            });

            setState(prev => ({
                ...prev,
                success: true,
                usdValue: '',
                xrpValue: ''
            }));
        } catch (error) {
            addToHistory({
                fromAmount: state.isXrpToUsd ? state.xrpValue : state.usdValue,
                fromCurrency: state.isXrpToUsd ? 'XRP' : 'USD',
                toAmount: state.isXrpToUsd ? state.usdValue : state.xrpValue,
                toCurrency: state.isXrpToUsd ? 'USD' : 'XRP',
                status: 'failed'
            });
            console.error('Swap failed:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Swap failed'
            }));
        } finally {
            setState(prev => ({ ...prev, isSwapping: false }));
        }
    };

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const clearSuccess = useCallback(() => {
        setState(prev => ({ ...prev, success: false }));
    }, []);

    const handleSwapClick = useCallback(() => {
        setState(prev => ({ ...prev, showConfirmation: true }));
    }, []);

    const handleConfirmSwap = async () => {
        setState(prev => ({ ...prev, showConfirmation: false }));
        await executeSwap();
    };

    const handleCancelSwap = useCallback(() => {
        setState(prev => ({ ...prev, showConfirmation: false }));
    }, []);

    return {
        ...state,
        handleXrpValueChange,
        handleUsdValueChange,
        handleSwitch,
        executeSwap,
        clearError,
        clearSuccess,
        canSwap: !!wallet && !!ammInfo,
        isLoading: state.isLoading,
        showConfirmation: state.showConfirmation,
        handleSwapClick,
        handleConfirmSwap,
        handleCancelSwap
    };
} 