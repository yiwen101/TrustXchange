// types/optionTypes.ts

export interface Option {
    id: number;
    optionType: string;
    strikePrice: number;
    expiryDate: string;
    lateDealPrice?: number;
    firstBid?: number;
    firstBidAmount?: number;
    firstAsk?: number;
    firstAskAmount?: number;
    dailyVolume?: number;
     createdAt: string;
     modifiedAt?: string;
}

export interface OptionOrderEvent {
   id: number;
   transactionHash: string;
   transactionUrl: string;
    optionId: number;
    posterAddress: string;
    orderId: number;
    dealPrice: number;
    amount: number;
    action: string;
    createdAt: string;
}

export interface OptionOrder {
    id: number;
    optionId: number;
    posterAddress: string;
    orderType: string;
    price: number;
    amount: number;
    filledAmount: number;
    isCancelled: boolean;
    createdAt: string;
}

export interface OptionUserBalanceResponse {
    ownedAmount: number;
    issuedAmount: number;
    sellingAmount: number;
}

 export interface OptionEvent {
    id: number;
    transactionHash: string;
    transactionUrl: string;
    address: string;
    optionId: number;
    action: string;
    amount: number;
    createdAt: string;
}

export interface TopOrdersResponse {
     buyOrders: OptionOrder[];
     sellOrders: OptionOrder[];
}