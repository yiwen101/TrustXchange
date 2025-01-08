import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Client, Wallet } from 'xrpl';
import xrp_api from "../api/xrp";
import { testnet_url} from "../const";
import { useThreadPool } from "../utils";
import { userUsdXrpAMMInfo } from "../api/xrp/amm_transection";
import { getWallet } from "../testWallets";
import { usePoolLendingActions } from "./usePoolLendingState";
import { getXRPBalance, getUSDBalance } from "../api/xrp/wallet";
import {swap_usdc_for_XRP,swap_XRP_for_usdc } from '../api/xrp/amm_transection'

const walletBalanceState = atom({
    key: "WALLET_BALANCE",
    default: {
        usd: 0,
        xrp: 0
    }
});

const connectedWalletState = atom({
    key: "CONNECTED_WALLET",
    default: null as Wallet | null,
});

const walletConnectionStatusState = atom({
    key: "WALLET_CONNECTION_STATUS",
    default: "disconnected" as "disconnected" | "connecting" | "connected",
});

const walletAMMState = atom({
    key: "WALLET_AMM_STATUS",
    default: null as userUsdXrpAMMInfo | null,
});

export const useConnectedWalletValues = () => {
    const connectedWallet = useRecoilValue(connectedWalletState);
    const connectionStatus = useRecoilValue(walletConnectionStatusState);
    const walletAMMnStatus = useRecoilValue(walletAMMState);
    const balances = useRecoilValue(walletBalanceState);
    return { connectedWallet, connectionStatus, walletAMMnStatus, balances };
}

export const useConnectedWalletActions = () => {
    const [connectedWalletValue, setConnectedWalletValue] = useRecoilState(connectedWalletState);
    const [connectionStatus, setConnectionStatus] = useRecoilState(walletConnectionStatusState);
    const [balances, setBalances] = useRecoilState(walletBalanceState);
    const setWalletAMMStatus = useSetRecoilState(walletAMMState);
    const threadPool = useThreadPool(8);
    const {onLogin, onLogout} = usePoolLendingActions();

    const fetchBalances = async (wallet: Wallet) => {
        try {
            const [xrpBalance, usdBalance] = await Promise.all([
                getXRPBalance(wallet),
                getUSDBalance(wallet)
            ]);
            
            setBalances({
                xrp: xrpBalance,
                usd: usdBalance
            });
        } catch (error) {
            console.error('Error fetching balances:', error);
        }
    };

    const connectOrCreateWallet = async () => {
        if (connectionStatus === "connected") {
            return;
        }
        setConnectionStatus("connecting");
        const client = new Client(testnet_url);
        try {
            await client.connect();
            const info = getWallet(0);
            const wallet = Wallet.fromSeed(info.secret);
            setConnectedWalletValue(wallet!);
            
            await fetchBalances(wallet);
            
            setConnectionStatus("connected");
            console.log("Connected wallet:", wallet);
            
            threadPool.run(async () => {
                const userAmmInfo = await xrp_api.get_user_usd_xrp_amm_contribution(wallet!);
                setWalletAMMStatus(userAmmInfo);
            });
            threadPool.run(async () => {
                onLogin(wallet!.classicAddress);
            });
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            setConnectionStatus("disconnected");
        } finally {
            await client.disconnect();
        }
    }

    const disconnectWallet = async () => {
        if (connectionStatus === "disconnected") {
            return;
        }
        setConnectionStatus("disconnected");  
        setConnectedWalletValue(null);
        setBalances({ usd: 0, xrp: 0 });
        setWalletAMMStatus(null);
        onLogout();
    }

    const getTruncatedAddress = () => {
        if(connectedWalletValue !== null) {
            const address = connectedWalletValue.classicAddress;
            return `${address.substring(0, 6)}...${address.slice(-4)}`;
        }
        return "";
    }

    const swapForXrp = async (usdAmount: number, xrpAmount: number) => {
        if (!connectedWalletValue) {
            throw new Error('Wallet not connected or AMM not loaded');
        }
        swap_usdc_for_XRP(
            connectedWalletValue,
            usdAmount,
            xrpAmount
        ).then(() => {
            fetchBalances(connectedWalletValue!);
        });
    }

    const swapForUsd = async (usdAmount: number, xrpAmount: number) => {
        if (!connectedWalletValue) {
            throw new Error('Wallet not connected or AMM not loaded');
        }
        swap_XRP_for_usdc(
            connectedWalletValue,
            xrpAmount,
            usdAmount
        ).then(() => {
            fetchBalances(connectedWalletValue!);
    });
    }

    return { 
        connectOrCreateWallet, 
        disconnectWallet, 
        getTruncatedAddress,
        get_connected_wallet: async () => {
            await connectOrCreateWallet();
            return connectedWalletValue;
        },
        swapForXrp,
        swapForUsd
    };
}