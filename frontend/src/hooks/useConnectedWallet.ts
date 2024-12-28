import { atom, useRecoilValue } from "recoil";
import { Wallet } from 'xrpl';

const connectedWalletState = atom({
    key: "CONNECTED_WALLET",
    default: null as  Wallet | null,
});

export const useconnectedWalletValues = () => {
    return useRecoilValue(connectedWalletState);
}

export const useConnectedWalletActions = () => {
    const connectedWalletValue = useconnectedWalletValues();
    const connectOrCreateWallet = async () => {
        // connect or create wallet
    }
    const disconnectWallet = async () => {
        // disconnect wallet
    }
    return { connectOrCreateWallet, disconnectWallet, connectedWalletValue };
}