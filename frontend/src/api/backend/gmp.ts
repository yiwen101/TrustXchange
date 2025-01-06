import axios from 'axios';
import {
    GmpCallRequest,
    GmpCallResponse,
} from './types/gmpTypes.ts';
import {BACKEND_URL} from '../../const.ts';

const gmpApi = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const callGmp = async (request: GmpCallRequest): Promise<GmpCallResponse> => {
    const response = await gmpApi.post('api/gmp/call', request);
    return response.data;
};

