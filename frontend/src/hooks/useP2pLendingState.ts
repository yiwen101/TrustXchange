import { atom, selector, useRecoilState, useRecoilValue } from 'recoil';
import {
    getAllBorrowingRequests,
    getBorrowingRequestByRequestId,
    getBorrowingRequestsByBorrower,
    getBorrowingRequestEventsByRequestId,
    getAllLendingRequests,
    getLendingRequestById,
    getLendingRequestsByLender,
    getLendingRequestEventsByRequestId,
    getLoanById,
    getLoansByBorrower,
    getLoansByLender,
    getLoansByLendRequestId,
    getLoansByBorrowRequestId,
    getLoanEventsByLoanId,
} from '../api/backend/p2p';
import {
    P2pBorrowingRequest,
    P2pBorrowingRequestEvent,
    P2pLendingRequest,
    P2pLendingRequestEvent,
    P2pLoan,
    P2pLoanEvent,
} from '../api/backend/types/p2pTypes';
import {
    createBorrowRequest,
    createLendRequest,
    cancelBorrowRequest,
    cancelLendRequest,
    liquidateLoan,
    repayLoan,
} from '../api/contract/p2p';
import * as xrpl from 'xrpl';
import { usdIssuedCurrency, xrpCurrency } from '../const';

// --- Atoms ---
const borrowingRequestsState = atom<P2pBorrowingRequest[]>({
    key: 'borrowingRequestsState',
    default: [],
});

const borrowingRequestState = atom<P2pBorrowingRequest | null>({
    key: 'borrowingRequestState',
    default: null,
});

const borrowingRequestEventsState = atom<P2pBorrowingRequestEvent[]>({
    key: 'borrowingRequestEventsState',
    default: [],
});

const lendingRequestsState = atom<P2pLendingRequest[]>({
    key: 'lendingRequestsState',
    default: [],
});

const lendingRequestState = atom<P2pLendingRequest | null>({
    key: 'lendingRequestState',
    default: null,
});

const lendingRequestEventsState = atom<P2pLendingRequestEvent[]>({
    key: 'lendingRequestEventsState',
    default: [],
});

const loanState = atom<P2pLoan | null>({
    key: 'loanState',
    default: null,
});

const loansState = atom<P2pLoan[]>({
    key: 'loansState',
    default: [],
});

const loanEventsState = atom<P2pLoanEvent[]>({
    key: 'loanEventsState',
    default: [],
});


// --- Selectors ---
const borrowingRequestsSelector = selector<P2pBorrowingRequest[]>({
    key: 'borrowingRequestsSelector',
    get: ({ get }) => get(borrowingRequestsState),
});

const borrowingRequestSelector = selector<P2pBorrowingRequest | null>({
    key: 'borrowingRequestSelector',
    get: ({ get }) => get(borrowingRequestState),
});

const borrowingRequestEventsSelector = selector<P2pBorrowingRequestEvent[]>({
    key: 'borrowingRequestEventsSelector',
    get: ({ get }) => get(borrowingRequestEventsState),
});

const lendingRequestsSelector = selector<P2pLendingRequest[]>({
    key: 'lendingRequestsSelector',
    get: ({ get }) => get(lendingRequestsState),
});

const lendingRequestSelector = selector<P2pLendingRequest | null>({
    key: 'lendingRequestSelector',
    get: ({ get }) => get(lendingRequestState),
});

const lendingRequestEventsSelector = selector<P2pLendingRequestEvent[]>({
    key: 'lendingRequestEventsSelector',
    get: ({ get }) => get(lendingRequestEventsState),
});

const loanSelector = selector<P2pLoan | null>({
    key: 'loanSelector',
    get: ({ get }) => get(loanState),
});


const loansSelector = selector<P2pLoan[]>({
    key: 'loansSelector',
    get: ({ get }) => get(loansState),
});

const loanEventsSelector = selector<P2pLoanEvent[]>({
    key: 'loanEventsSelector',
    get: ({ get }) => get(loanEventsState),
});


// --- Value Hook ---
export const useP2pValues = () => {
    return {
        borrowingRequests: useRecoilValue(borrowingRequestsSelector),
        borrowingRequest: useRecoilValue(borrowingRequestSelector),
        borrowingRequestEvents: useRecoilValue(borrowingRequestEventsSelector),
        lendingRequests: useRecoilValue(lendingRequestsSelector),
        lendingRequest: useRecoilValue(lendingRequestSelector),
        lendingRequestEvents: useRecoilValue(lendingRequestEventsSelector),
        loan: useRecoilValue(loanSelector),
        loans: useRecoilValue(loansSelector),
        loanEvents: useRecoilValue(loanEventsSelector),
    };
};


// --- Action Hook ---
let isInitialized = false;

export const useP2pActions = () => {
    // --- Borrowing Request State ---
    const [borrowingRequests, setBorrowingRequests] = useRecoilState(borrowingRequestsState);
    const [borrowingRequest, setBorrowingRequest] = useRecoilState(borrowingRequestState);
    const [borrowingRequestEvents, setBorrowingRequestEvents] = useRecoilState(borrowingRequestEventsState);

    // --- Lending Request State ---
    const [lendingRequests, setLendingRequests] = useRecoilState(lendingRequestsState);
    const [lendingRequest, setLendingRequest] = useRecoilState(lendingRequestState);
    const [lendingRequestEvents, setLendingRequestEvents] = useRecoilState(lendingRequestEventsState);

    // --- Loan State ---
    const [loan, setLoan] = useRecoilState(loanState);
    const [loans, setLoans] = useRecoilState(loansState);
    const [loanEvents, setLoanEvents] = useRecoilState(loanEventsState);


    const fetchAllBorrowingRequests = async () => {
        try {
            const data = await getAllBorrowingRequests();
            setBorrowingRequests(data);
        } catch (error) {
            console.error("Error fetching all borrowing requests:", error);
            setBorrowingRequests([]);
        }
    };

    const fetchBorrowingRequestByRequestId = async (requestId: number) => {
        try {
            const data = await getBorrowingRequestByRequestId(requestId);
            setBorrowingRequest(data);
        } catch (error) {
            console.error("Error fetching borrowing request by id:", error);
            setBorrowingRequest(null);
        }
    };

      const fetchBorrowingRequestsByBorrower = async (borrowerAddress: string) => {
        try {
            const data = await getBorrowingRequestsByBorrower(borrowerAddress);
            setBorrowingRequests(data);
        } catch (error) {
            console.error("Error fetching borrowing requests by borrower:", error);
            setBorrowingRequests([]);
        }
    };


    const fetchBorrowingRequestEventsByRequestId = async (requestId: number) => {
        try {
            const data = await getBorrowingRequestEventsByRequestId(requestId);
            setBorrowingRequestEvents(data);
        } catch (error) {
            console.error("Error fetching borrowing request events:", error);
            setBorrowingRequestEvents([]);
        }
    };

    const fetchAllLendingRequests = async () => {
        try {
            const data = await getAllLendingRequests();
            setLendingRequests(data);
        } catch (error) {
            console.error("Error fetching all lending requests:", error);
            setLendingRequests([]);
        }
    };

    const fetchLendingRequestById = async (requestId: number) => {
        try {
            const data = await getLendingRequestById(requestId);
            setLendingRequest(data);
        } catch (error) {
            console.error("Error fetching lending request by id:", error);
            setLendingRequest(null);
        }
    };

    const fetchLendingRequestsByLender = async (lenderAddress: string) => {
      try {
          const data = await getLendingRequestsByLender(lenderAddress);
          setLendingRequests(data);
      } catch (error) {
          console.error("Error fetching lending requests by lender:", error);
          setLendingRequests([]);
      }
  };

    const fetchLendingRequestEventsByRequestId = async (requestId: number) => {
        try {
            const data = await getLendingRequestEventsByRequestId(requestId);
            setLendingRequestEvents(data);
        } catch (error) {
            console.error("Error fetching lending request events:", error);
            setLendingRequestEvents([]);
        }
    };

    const fetchLoanById = async (loanId: number) => {
        try {
            const data = await getLoanById(loanId);
            setLoan(data);
        } catch (error) {
            console.error("Error fetching loan by id:", error);
            setLoan(null);
        }
    };


    const fetchLoansByBorrower = async (borrowerAddress: string) => {
        try {
            const data = await getLoansByBorrower(borrowerAddress);
            setLoans(data);
        } catch (error) {
            console.error("Error fetching loans by borrower:", error);
            setLoans([]);
        }
    };

    const fetchLoansByLender = async (lenderAddress: string) => {
        try {
            const data = await getLoansByLender(lenderAddress);
            setLoans(data);
        } catch (error) {
            console.error("Error fetching loans by lender:", error);
            setLoans([]);
        }
    };

    const fetchLoansByLendRequestId = async (lendRequestId: number) => {
      try {
          const data = await getLoansByLendRequestId(lendRequestId);
          setLoans(data);
      } catch (error) {
          console.error("Error fetching loans by lend request id:", error);
          setLoans([]);
      }
    };

    const fetchLoansByBorrowRequestId = async (borrowRequestId: number) => {
      try {
          const data = await getLoansByBorrowRequestId(borrowRequestId);
          setLoans(data);
      } catch (error) {
          console.error("Error fetching loans by borrow request id:", error);
          setLoans([]);
      }
    };

    const fetchLoanEventsByLoanId = async (loanId: number) => {
        try {
            const data = await getLoanEventsByLoanId(loanId);
            setLoanEvents(data);
        } catch (error) {
            console.error("Error fetching loan events:", error);
            setLoanEvents([]);
        }
    };

    const init = async () => {
        if (!isInitialized) {
           await Promise.all([
             fetchAllBorrowingRequests(),
             fetchAllLendingRequests()
           ]);
            isInitialized = true;
        }
    }

    const refetchData = async (address: string) => {
        await Promise.all([
            fetchBorrowingRequestsByBorrower(address),
            fetchLendingRequestsByLender(address),
            fetchLoansByBorrower(address),
            fetchLoansByLender(address),
        ]);
    };
    
    const onLogin = async (address: string) => {
        await refetchData(address);
    };

    const onLogout = () => {
        setBorrowingRequests([]);
        setBorrowingRequest(null);
        setBorrowingRequestEvents([]);
        setLendingRequests([]);
        setLendingRequest(null);
        setLendingRequestEvents([]);
        setLoan(null);
        setLoans([]);
        setLoanEvents([]);
    };

   const executeAndRefetch = async (apiCall: () => Promise<void>, address: string | undefined) => {
        try {
          await apiCall();
          await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
            if(address){
                 await refetchData(address);
              }else{
                 await Promise.all([
                    fetchAllBorrowingRequests(),
                    fetchAllLendingRequests()
                  ]);
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
        ), address);
    };

    const handleCreateLendRequest = async (user: xrpl.Wallet, amountToLendUsd: number, minCollateralRatio: number,liquidationThreshold:number, desiredInterestRate: number, paymentDuration: number, minimalPartialFill:number, address?: string) => {
      await executeAndRefetch(() => createLendRequest(user,minCollateralRatio,liquidationThreshold, desiredInterestRate, paymentDuration,minimalPartialFill,usdIssuedCurrency(amountToLendUsd)), address);
  };

    const handleCancelBorrowRequest = async (user: xrpl.Wallet, requestId: number, address?: string) => {
        await executeAndRefetch(() => cancelBorrowRequest(user, requestId), address);
    };

     const handleCancelLendRequest = async (user: xrpl.Wallet, requestId: number, address?: string) => {
       await executeAndRefetch(() => cancelLendRequest(user, requestId), address);
     };

    const handleRepayLoan = async (user: xrpl.Wallet, repayamount:number, loanId:number, address?: string) => {
        await executeAndRefetch(() => repayLoan(user, repayamount, loanId,usdIssuedCurrency(repayamount)), address);
    };

    const handleLiquidateLoan = async (user: xrpl.Wallet, payamount:number, loanId: number, address?: string) => {
        await executeAndRefetch(() => liquidateLoan(user, loanId,xrpCurrency(payamount)), address);
    };



    return {
        fetchAllBorrowingRequests,
        fetchBorrowingRequestByRequestId,
        fetchBorrowingRequestsByBorrower,
        fetchBorrowingRequestEventsByRequestId,
        fetchAllLendingRequests,
        fetchLendingRequestById,
        fetchLendingRequestsByLender,
        fetchLendingRequestEventsByRequestId,
        fetchLoanById,
        fetchLoansByBorrower,
        fetchLoansByLender,
        fetchLoansByLendRequestId,
        fetchLoansByBorrowRequestId,
        fetchLoanEventsByLoanId,
        init,
        
        onLogin,
        onLogout,

        handleCreateBorrowRequest,
        handleCreateLendRequest,
        handleCancelBorrowRequest,
        handleCancelLendRequest,
        handleRepayLoan,
        handleLiquidateLoan,
    };
};