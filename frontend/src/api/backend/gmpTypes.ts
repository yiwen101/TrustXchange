export interface GmpCallRequest {
    payloadString: string;
    transactionHash: string;
}

export interface GmpCallResponse {
    success: boolean;
    message: string;
}