import axios from 'axios';
import {
    GmpCallRequest,
    GmpCallResponse,
} from './gmpTypes.ts';

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
    throw new Error("REACT_APP_BACKEND_URL is not defined in .env");
  }

const gmpApi = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const callGmp = async (request: GmpCallRequest): Promise<GmpCallResponse> => {
    const response = await gmpApi.post('/gmp/call', request);
    return response.data;
};

