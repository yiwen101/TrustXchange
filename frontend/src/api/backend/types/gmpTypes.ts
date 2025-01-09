export interface GmpCallRequest {
    payloadString: string;
    transactionHash: string;
}

export interface GmpCallResponse {
    isReceived: boolean;
    isApproved: boolean;
    isCalled: boolean;
    getewayTransactionHash: string;
    contractTransactionHash: string;
}