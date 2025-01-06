import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Client, Wallet } from 'xrpl';
import xrp_api from "../api/xrp";
import { testnet_url } from "../const";
import { useThreadPool } from "../utils";
import { userUsdXrpAMMInfo } from "../api/xrp/amm_transection";
import { getRandomeWallet } from "../testWallets";
import { usePoolLendingActions } from "./usePoolLendingState";

const connectedWalletState = atom({
    key: "CONNECTED_WALLET",
    default: null as  Wallet | null,
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
    return { connectedWallet, connectionStatus, walletAMMnStatus };
}

export const useConnectedWalletActions = () => {
    const [connectedWalletValue, setConnectedWalletValue] = useRecoilState(connectedWalletState);
    const [connectionStatus, setConnectionStatus] = useRecoilState(walletConnectionStatusState);
    const setWalletAMMStatus = useSetRecoilState(walletAMMState);
    const threadPool = useThreadPool(8);
    const {onLogin,onLogout} = usePoolLendingActions();

    const connectOrCreateWallet = async () => {
        if (connectionStatus === "connected") {
            return;
        }
        setConnectionStatus("connecting");
        const client = new Client(testnet_url);
        try {
            await client.connect();
            const info = getRandomeWallet()
            const wallet = Wallet.fromSeed(info.secret);
            //const wallet = await xrp_api.create_wallet();
            await xrp_api.get_funded_wallet_with_usd(1000, 1000, wallet);
            setConnectedWalletValue(wallet!);
            setConnectionStatus("connected");
            console.log("Connected wallet:", wallet);
            
            
            // on connect
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
    const get_connected_wallet = async () => {
        await connectOrCreateWallet();
        return connectedWalletValue;
    }
    const disconnectWallet = async () => {
        if (connectionStatus === "disconnected") {
            return;
        }
        setConnectionStatus("disconnected");  
        setConnectedWalletValue(null);

        // on disconnect
        setWalletAMMStatus(null);
        onLogout();
    }
    const getTruncatedAddress = () => {
        if(connectedWalletValue !== null) {
            const address = connectedWalletValue.classicAddress
            return `${connectedWalletValue.classicAddress.substring(0, 6)}...${address.slice(-4)}`;
        }
        return "";
    }
    return { connectOrCreateWallet, disconnectWallet, get_connected_wallet, getTruncatedAddress };
}