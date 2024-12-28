// useConnectedClient.ts
import { useEffect, useState, useCallback } from 'react';
import { Client } from 'xrpl';
import { atom, useRecoilState } from 'recoil';
import { testnet_url } from '../const';

// todo, test this code?
const xrplClientState = atom({
    key: 'XRPL_CLIENT',
    default: null as Client | null,
});

export const useXRPLClient = () => {
    const [client, setClient] = useRecoilState(xrplClientState);

   
    const attemptConnect = async (_client:Client) => {
         if (_client.isConnected()) {
            return;
         }
         for (let i = 0; i < 3; i++) {
            try {
                await _client.connect();
                break;
            } catch (e) {
                console.error('Failed to connect to XRPL. Retrying...');
            }
         }
         if (!_client.isConnected()) {
            throw new Error('Failed to connect to XRPL');
         }
    };

    const initializeClient = async () => {
        if (client && client.isConnected()) {
            return;
        }
        if (!client) {
            const _client = new Client(testnet_url);
            await attemptConnect(_client)
            setClient(_client)
        } else {
            await attemptConnect(client)
        } 
    };

    const get_connected_client = async () => {
        await initializeClient();
        return client as Client;
    };

    return { initializeClient, get_connected_client };
};