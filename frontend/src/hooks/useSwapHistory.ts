import { useState, useEffect } from 'react';
import { useConnectedWallet } from './useConnectedWallet';

export interface SwapHistory {
    id: string;
    timestamp: number;
    fromAmount: string;
    fromCurrency: 'XRP' | 'USD';
    toAmount: string;
    toCurrency: 'XRP' | 'USD';
    status: 'success' | 'failed';
    txHash?: string;
}

export function useSwapHistory() {
    const [history, setHistory] = useState<SwapHistory[]>([]);
    const { wallet } = useConnectedWallet();

    useEffect(() => {
        if (wallet) {
            // 从本地存储加载历史记录
            const savedHistory = localStorage.getItem(`swap_history_${wallet.address}`);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        }
    }, [wallet]);

    const addToHistory = (swap: Omit<SwapHistory, 'id' | 'timestamp'>) => {
        const newEntry: SwapHistory = {
            ...swap,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };

        setHistory(prev => {
            const updated = [newEntry, ...prev].slice(0, 10); // 只保留最近10条记录
            if (wallet) {
                localStorage.setItem(`swap_history_${wallet.address}`, JSON.stringify(updated));
            }
            return updated;
        });
    };

    return {
        history,
        addToHistory
    };
} 