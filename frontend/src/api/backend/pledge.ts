import axios from 'axios';
import { PoolLendingBorrower, PoolLendingContributor, PoolLendingPoolEvents, PoolLendingUserEvents } from './types/pledgeTypes.ts';

import {BACKEND_URL} from '../../const.ts';

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      'Content-Type': 'application/json',
    },
});


// --- Pool Lending Borrower Endpoints ---
export const getBorrowerByAddress = async (borrowerAddress: string): Promise<PoolLendingBorrower> => {
    const response = await api.get(`/api/pledge/borrowers/${borrowerAddress}`);
    return response.data;
};

// --- Pool Lending Contributor Endpoints ---
export const getContributorByAddress = async (contributorAddress: string): Promise<PoolLendingContributor> => {
    const response = await api.get(`/api/pledge/contributors/${contributorAddress}`);
    return response.data;
};


// --- Pool Lending Contributor Event Endpoints ---
export const getEventsByUserAddress = async (address: string): Promise<PoolLendingUserEvents[]> => {
    const response = await api.get(`/api/pledge/events/${address}`);
    return response.data;
};

// --- Pool Lending Pool Event Endpoints ---
export const getAllPoolEvents = async (page: number = 0, size: number = 10): Promise<{ content: PoolLendingPoolEvents[], totalPages: number, totalElements: number }> => {
    const response = await api.get(`/api/pledge/pool-events`, {
      params: { page, size },
    });
    return response.data;
};