import { atom, useRecoilState, useRecoilValue } from "recoil";
import { Client, Wallet } from 'xrpl';
import xrp_api from "../api/xrp";
import { testnet_url } from "../const";

const connectedWalletState = atom({
    key: "CONNECTED_WALLET",
    default: null as  Wallet | null,
});

const walletConnectionStatusState = atom({
    key: "WALLET_CONNECTION_STATUS",
    default: "disconnected" as "disconnected" | "connecting" | "connected",
});

export const useConnectedWalletValues = () => {
    const connectedWallet = useRecoilValue(connectedWalletState);
    const connectionStatus = useRecoilValue(walletConnectionStatusState);
    return { connectedWallet, connectionStatus };
}

export const useConnectedWalletActions = () => {
    const [connectedWalletValue, setConnectedWalletValue] = useRecoilState(connectedWalletState);
    const [connectionStatus, setConnectionStatus] = useRecoilState(walletConnectionStatusState);
    const connectOrCreateWallet = async () => {
        if (connectionStatus === "connected") {
            return;
        }
        setConnectionStatus("connecting");
        const client = new Client(testnet_url);
        try {
            await client.connect();
            const wallet = await xrp_api.create_wallet();
            //const wallet = await xrp_api.get_funded_wallet_with_usd(client, 1000, 1000, true);
            setConnectedWalletValue(wallet!);
            setConnectionStatus("connected");
            console.log("Connected wallet:", wallet);
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