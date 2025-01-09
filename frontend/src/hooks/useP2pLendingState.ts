// hooks/useP2p.ts
import { useRecoilValue, useSetRecoilState,atom } from 'recoil';
import xrpl from 'xrpl';
import {
    getAllRequests,
    getLoansByAddress,
    getEventsByAddress
} from '../api/backend/p2p'; // Assuming you save p2pApi.ts in same directory

import {
    P2pLoan,
    AllRequestsResponse,
    AllEventsResponse
} from '../api/backend/types/p2pTypes';
import { cancelBorrowRequest, cancelLendRequest, createBorrowRequest, createLendRequest, liquidateLoan, repayLoan } from '../api/contract/p2p';
import { xrpCurrency, usdIssuedCurrency } from '../const';
import { useCurrentGMPCallState } from './useCurrnetGMPCallState';

export const allRequestsState = atom<AllRequestsResponse | null>({
    key: 'P2P_allRequestsState',
    default: null,
});

export const loansByAddressState = atom< P2pLoan[] | null>({
    key: 'P2P_loansByAddressState',
    default: null,
});

export const eventsByAddressState = atom<AllEventsResponse| null> ({
    key: 'P2P_eventsByAddressState',
    default: null,
});


export const useP2pValues = () => {
  const allRequests = useRecoilValue(allRequestsState);
  const loansByAddress = useRecoilValue(loansByAddressState);
  const eventsByAddress = useRecoilValue(eventsByAddressState);
  return {
    allRequests,
    loansByAddress,
    eventsByAddress,
  };
};

let initialized = false;

export const useP2pActions = () => {
    const setAllRequests = useSetRecoilState(allRequestsState);
    const setLoansByAddress = useSetRecoilState(loansByAddressState);
    const setEventsByAddress = useSetRecoilState(eventsByAddressState);
    const {beforeCallBackend, afterCallBackend} = useCurrentGMPCallState();

    const fetchAllRequests = async () => {
        const requests = await getAllRequests();
        setAllRequests(requests);
    };


    const fetchLoansByAddress = async (address: string) => {
        const loans = await getLoansByAddress(address);
        setLoansByAddress(loans);
    };

    const fetchEventsByAddress = async (address: string) => {
        const events = await getEventsByAddress(address);
        setEventsByAddress(events);
    };

    const onLoginP2p = async (address: string) => {
        Promise.all([
            fetchLoansByAddress(address),
            fetchEventsByAddress(address),
        ]);
    }

    const onLogoutP2p = () => {
        setLoansByAddress(null);
        setEventsByAddress(null);
    }

    const initP2p = async () => {
        if (initialized) {
            return;
        }
        initialized = true;
        await fetchAllRequests();
    }

    const executeAndRefetch = async (apiCall: () => Promise<void>, address: string | undefined) => {
        try {
          await apiCall();
          await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            if(address){
                await Promise.all([
                    onLoginP2p(address),
                    fetchAllRequests(),
                ]);
              }else{
                 await fetchAllRequests();
             }
        } catch (error) {
          console.error("Error during API call or refetch:", error);
        }
    };

    const handleCreateBorrowRequest = async (user: xrpl.Wallet, amountToBorrowUsd: number, collateralAmountXrp: number, maxCollateralRatio: number,liquidationThreshold:number, desiredInterestRate: number, paymentDuration: number, minimalPartialFill:number, address?: string) => {
        await executeAndRefetch(() => createBorrowRequest(
            user,
            amountToBorrowUsd,
            maxCollateralRatio,
            liquidationThreshold, 
            desiredInterestRate, 
            paymentDuration,
            minimalPartialFill,
            xrpCurrency(collateralAmountXrp),
            beforeCallBackend,
            afterCallBackend
        ), address);
    };

    const handleCreateLendRequest = async (user: xrpl.Wallet, amountToLendUsd: number, minCollateralRatio: number,liquidationThreshold:number, desiredInterestRate: number, paymentDuration: number, minimalPartialFill:number, address?: string) => {
      await executeAndRefetch(() => createLendRequest(user,minCollateralRatio,liquidationThreshold, desiredInterestRate, paymentDuration,minimalPartialFill,usdIssuedCurrency(amountToLendUsd),beforeCallBackend,afterCallBackend), address);
  };

    const handleCancelBorrowRequest = async (user: xrpl.Wallet, requestId: number, address?: string) => {
        await executeAndRefetch(() => cancelBorrowRequest(user, requestId,beforeCallBackend,afterCallBackend), address);
    };

     const handleCancelLendRequest = async (user: xrpl.Wallet, requestId: number, address?: string) => {
       await executeAndRefetch(() => cancelLendRequest(user, requestId,beforeCallBackend,afterCallBackend), address);
     };

    const handleRepayLoan = async (user: xrpl.Wallet, repayamount:number, loanId:number, address?: string) => {
        await executeAndRefetch(() => repayLoan(user, repayamount, loanId,usdIssuedCurrency(repayamount),beforeCallBackend,afterCallBackend), address);
    };

    const handleLiquidateLoan = async (user: xrpl.Wallet, payamount:number, loanId: number, address?: string) => {
        await executeAndRefetch(() => liquidateLoan(user, loanId,xrpCurrency(payamount),beforeCallBackend,afterCallBackend), address);
    };


    return {
        fetchAllRequests,
        fetchLoansByAddress,
        fetchEventsByAddress,
        onLoginP2p,
        onLogoutP2p,
        initP2p,

        handleCreateBorrowRequest,
        handleCreateLendRequest,
        handleCancelBorrowRequest,
        handleCancelLendRequest,
        handleRepayLoan,
        handleLiquidateLoan,
    };
};