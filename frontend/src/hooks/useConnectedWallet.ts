import { atom, useRecoilState, useRecoilValue } from "recoil";
import { Client, Wallet } from 'xrpl';
//import xrp_api from "../api/xrp";
import * as utils from "../api/xrpJs/utils";

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
    const connectOrCreateWallet = async (client: Client) => {
        if (connectionStatus === "connected") {
            return;
        }
        setConnectionStatus("connecting");
        try {
            const wallet = await utils.create_and_write_wallet(client, "fileName.json");
            setConnectedWalletValue(wallet);
            setConnectionStatus("connected");
            console.log("Connected wallet:", wallet);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            setConnectionStatus("disconnected");
        }
    }
    const get_connected_wallet = async (client: Client) => {
        await connectOrCreateWallet(client);
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