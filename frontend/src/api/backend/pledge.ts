import axios from 'axios';
import { PoolLendingBorrower, PoolLendingBorrowerEvents, PoolLendingContributor, PoolLendingContributorEvents, PoolLendingPoolEvents } from './types/pledgeTypes.ts';

import {BACKEND_URL} from '../../const.ts';

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      'Content-Type': 'application/json',
    },
});


// --- Pool Lending Borrower Endpoints ---
export const getBorrowerByAddress = async (borrowerAddress: string): Promise<PoolLendingBorrower> => {
    const response = await api.get(`/pledge/borrowers/${borrowerAddress}`);
    return response.data;
};

// --- Pool Lending Borrower Event Endpoints ---
export const getBorrowerEventsByBorrowerAddress = async (borrowerAddress: string): Promise<PoolLendingBorrowerEvents[]> => {
    const response = await api.get(`/pledge/borrower-events/${borrowerAddress}`);
    return response.data;
};

// --- Pool Lending Contributor Endpoints ---
export const getContributorByAddress = async (contributorAddress: string): Promise<PoolLendingContributor> => {
    const response = await api.get(`/pledge/contributors/${contributorAddress}`);
    return response.data;
};


// --- Pool Lending Contributor Event Endpoints ---
export const getContributorEventsByContributorAddress = async (contributorAddress: string): Promise<PoolLendingContributorEvents[]> => {
    const response = await api.get(`/pledge/contributor-events/${contributorAddress}`);
    return response.data;
};

// --- Pool Lending Pool Event Endpoints ---
export const getAllPoolEvents = async (page: number = 0, size: number = 10): Promise<{ content: PoolLendingPoolEvents[], totalPages: number, totalElements: number }> => {
    const response = await api.get(`/pledge/pool-events`, {
      params: { page, size },
    });
    return response.data;
};