// xrplClient.ts
import { Client, Wallet } from 'xrpl';
import { atom, useRecoilState } from 'recoil';

// Create a Recoil atom to store the XRPL client
export const xrplClientState = atom<Client | null>({
    key: 'XRPL_CLIENT',
    default: null,
});

// Initialize and connect the XRPL client
export const initializeXRPLClient = async () => {
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    return client;
};

// Hook to provide XRPL client globally
export const useXRPLClient = () => {
    const [client, setClient] = useRecoilState(xrplClientState);

    if (!client) {
        initializeXRPLClient().then(setClient).catch(() => {
            // Handle connection error
        });
    }

    // Ensure the client is connected
    const ensureConnected = async () => {
        if (client && !client.isConnected()) {
            await client.connect();
        }
    };

    return { client, ensureConnected };
};

export default useXRPLClient;