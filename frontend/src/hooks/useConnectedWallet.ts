import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Client, Wallet } from 'xrpl';
import xrp_api from "../api/xrp";
import { testnet_url, currencyCode } from "../const";
import { useThreadPool } from "../utils";
import { userUsdXrpAMMInfo, swap_XRP_for_usdc, swap_usdc_for_XRP } from "../api/xrp/amm_transection";
import { getWallet } from "../testWallets";
import { usePoolLendingActions } from "./usePoolLendingState";
import { getXRPBalance, getUSDBalance } from "../api/xrp/wallet";

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
            //const wallet = await xrp_api.create_wallet();
            //await xrp_api.fund_wallet(wallet);
            setConnectedWalletValue(wallet!);
            
            
            setConnectionStatus("connected");
            console.log("Connected wallet:", wallet);
            
            threadPool.run(async () => {
                await fetchBalances(wallet!);
            });

            
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

    const contributeToPool = async (xrpAmount: number, usdAmount: number) => {
        if (!connectedWalletValue) return;
        await threadPool.run(async () => {
            await xrp_api.add_usd_to_XRP_USDC_AMM(connectedWalletValue, usdAmount);
            await xrp_api.add_xrp_to_XRP_USDC_AMM(connectedWalletValue, xrpAmount);
            await fetchBalances(connectedWalletValue);
            const userAmmInfo = await xrp_api.get_user_usd_xrp_amm_contribution(connectedWalletValue);
            setWalletAMMStatus(userAmmInfo);
        });
    };

    const withdrawFromPool = async () => {
        if (!connectedWalletValue) return;
        await threadPool.run(async () => {
            await xrp_api.withdraw_from_XRP_USDC_AMM(connectedWalletValue);
            await fetchBalances(connectedWalletValue);
            const userAmmInfo = await xrp_api.get_user_usd_xrp_amm_contribution(connectedWalletValue);
            setWalletAMMStatus(userAmmInfo);
        });
    };

    return { 
        connectOrCreateWallet, 
        disconnectWallet, 
        getTruncatedAddress,
        fetchBalances: async () => {
            if (connectedWalletValue) {
                await fetchBalances(connectedWalletValue);
            }
        },
        get_connected_wallet: async () => {
            await connectOrCreateWallet();
            return connectedWalletValue;
        },
        swapForXrp: async (xrpAmount: number, minUsdReceived: number, maxSlippageTolerance: number) => {
            if (!connectedWalletValue) return;
            await swap_XRP_for_usdc(connectedWalletValue, xrpAmount, minUsdReceived, maxSlippageTolerance);
            await fetchBalances(connectedWalletValue);
        },
        swapForUsd: async (usdAmount: number, minXrpReceived: number, maxSlippageTolerance: number) => {
            if (!connectedWalletValue) return;
            await swap_usdc_for_XRP(connectedWalletValue, usdAmount, minXrpReceived, maxSlippageTolerance);
            await fetchBalances(connectedWalletValue);
        },
        contributeToPool,
        withdrawFromPool,
    };
}