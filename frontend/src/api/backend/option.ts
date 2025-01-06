import axios from 'axios';
import {
    Option,
    OptionOrderEvent,
    OptionOrder,
    OptionUserBalanceResponse,
    OptionEvent,
    TopOrdersResponse
} from './types/optionTypes'; // Assuming you have types defined

import {BACKEND_URL} from '../../const.ts';

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Option Endpoints ---

export const getAllOptions = async (): Promise<Option[]> => {
    const response = await api.get('/api/options');
    return response.data;
};

export const getOptionTradeEvents = async (optionId: number, period: string = "day"): Promise<OptionOrderEvent[]> => {
    const response = await api.get(`/api/options/${optionId}/trade-events`, { params: { period } });
    return response.data;
};


export const getTop5Orders = async (optionId: number): Promise<TopOrdersResponse> => {
    const response = await api.get(`/api/options/${optionId}/orders`);
    return response.data;
};

export const getUserBalances = async (optionId: number, address: string): Promise<OptionUserBalanceResponse> => {
    const response = await api.get(`/api/options/${optionId}/user/${address}/balances`);
    return response.data;
};

export const getSellOrdersByUser = async (optionId: number, address: string): Promise<OptionOrder[]> => {
    const response = await api.get(`/api/options/${optionId}/user/${address}/sell-orders`);
    return response.data;
};

export const getBuyOrdersByUser = async (optionId: number, address: string): Promise<OptionOrder[]> => {
    const response = await api.get(`/api/options/${optionId}/user/${address}/buy-orders`);
    return response.data;
};

export const getOptionEventsByUser = async (optionId: number, address: string): Promise<OptionEvent[]> => {
    const response = await api.get(`/api/options/${optionId}/user/${address}/option-events`);
    return response.data;
};

export const getOptionTradeEventsByUser = async (optionId: number, address: string): Promise<OptionOrderEvent[]> => {
     const response = await api.get(`/api/options/${optionId}/user/${address}/trade-events`);
    return response.data;
};