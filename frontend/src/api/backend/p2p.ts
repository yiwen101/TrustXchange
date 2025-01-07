import axios from 'axios';
import {
    P2pLoan,
    AllRequestsResponse,
    AllEventsResponse
} from './types/p2pTypes';

import {BACKEND_URL} from '../../const.ts';

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const getAllRequests = async (): Promise<AllRequestsResponse> => {
    const response = await api.get<AllRequestsResponse>('/api/p2p/requests');
    return response.data;
};

export const getLoansByAddress = async (address: string): Promise<P2pLoan[]> => {
    const response = await api.get<P2pLoan[]>(`/api/p2p/loans/address/${address}`);
    return response.data;
};


export const getEventsByAddress = async (address: string): Promise<AllEventsResponse> => {
    const response = await api.get<AllEventsResponse>(`/api/p2p/events/address/${address}`);
    return response.data;
};