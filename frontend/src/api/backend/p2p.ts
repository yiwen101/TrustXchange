import axios from 'axios';
import {
    P2pBorrowingRequest,
    P2pBorrowingRequestEvent,
    P2pLendingRequest,
    P2pLendingRequestEvent,
    P2pLoan,
    P2pLoanEvent
} from './p2pTypes';

const BACKEND_URL = 'localhost:8080';

if (!BACKEND_URL) {
    throw new Error("REACT_APP_BACKEND_URL is not defined in .env");
  }

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Borrowing Request Endpoints ---
export const getAllBorrowingRequests = async (): Promise<P2pBorrowingRequest[]> => {
    const response = await api.get('/p2p/borrowing-requests');
    return response.data;
};

export const getBorrowingRequestByRequestId = async (requestId: number): Promise<P2pBorrowingRequest> => {
    const response = await api.get(`/p2p/borrowing-requests/${requestId}`);
    return response.data;
};

export const getBorrowingRequestsByBorrower = async (borrower: string): Promise<P2pBorrowingRequest[]> => {
    const response = await api.get(`/p2p/borrowing-requests/borrower/${borrower}`);
    return response.data;
};


// --- Borrowing Request Event Endpoints ---
export const getBorrowingRequestEventsByRequestId = async (requestId: number): Promise<P2pBorrowingRequestEvent[]> => {
    const response = await api.get(`/p2p/borrowing-request-events/${requestId}`);
    return response.data;
};


// --- Lending Request Endpoints ---
export const getAllLendingRequests = async (): Promise<P2pLendingRequest[]> => {
    const response = await api.get('/p2p/lending-requests');
    return response.data;
};

export const getLendingRequestById = async (requestId: number): Promise<P2pLendingRequest> => {
    const response = await api.get(`/p2p/lending-requests/${requestId}`);
    return response.data;
};

export const getLendingRequestsByLender = async (lender: string): Promise<P2pLendingRequest[]> => {
    const response = await api.get(`/p2p/lending-requests/lender/${lender}`);
    return response.data;
};


// --- Lending Request Event Endpoints ---
export const getLendingRequestEventsByRequestId = async (requestId: number): Promise<P2pLendingRequestEvent[]> => {
    const response = await api.get(`/p2p/lending-request-events/${requestId}`);
    return response.data;
};


// --- Loan Endpoints ---
export const getLoanById = async (loanId: number): Promise<P2pLoan> => {
    const response = await api.get(`/p2p/loans/${loanId}`);
    return response.data;
};

export const getLoansByBorrower = async (borrower: string): Promise<P2pLoan[]> => {
    const response = await api.get(`/p2p/loans/borrower/${borrower}`);
    return response.data;
};

export const getLoansByLender = async (lender: string): Promise<P2pLoan[]> => {
    const response = await api.get(`/p2p/loans/lender/${lender}`);
    return response.data;
};
export const getLoansByLendRequestId = async (lendRequestId: number): Promise<P2pLoan[]> => {
    const response = await api.get(`/p2p/loans/lendRequest/${lendRequestId}`);
    return response.data;
};

export const getLoansByBorrowRequestId = async (borrowRequestId: number): Promise<P2pLoan[]> => {
    const response = await api.get(`/p2p/loans/borrowRequest/${borrowRequestId}`);
    return response.data;
};


// --- Loan Event Endpoints ---
export const getLoanEventsByLoanId = async (loanId: number): Promise<P2pLoanEvent[]> => {
    const response = await api.get(`/p2p/loan-events/loan/${loanId}`);
    return response.data;
};