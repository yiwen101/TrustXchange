import { atom, selector, useRecoilState, useRecoilValue } from 'recoil';
import {
    getBorrowerByAddress,
    getBorrowerEventsByBorrowerAddress,
    getContributorByAddress,
    getContributorEventsByContributorAddress,
    getAllPoolEvents,
} from '../api/backend/pledge';
import {
    PoolLendingBorrower,
    PoolLendingBorrowerEvents,
    PoolLendingContributor,
    PoolLendingContributorEvents,
    PoolLendingPoolEvents,
} from '../api/backend/types/pledgeTypes';

// --- Atoms ---

const borrowerState = atom<PoolLendingBorrower | null>({
    key: 'borrowerState',
    default: null,
});

const borrowerEventsState = atom<PoolLendingBorrowerEvents[]>({
    key: 'borrowerEventsState',
    default: [],
});

const contributorState = atom<PoolLendingContributor | null>({
    key: 'contributorState',
    default: null,
});

const contributorEventsState = atom<PoolLendingContributorEvents[]>({
    key: 'contributorEventsState',
    default: [],
});

const poolEventsState = atom<{ content: PoolLendingPoolEvents[]; totalPages: number; totalElements: number }>({
  key: 'poolEventsState',
  default: { content: [], totalPages: 0, totalElements: 0 },
});

const poolEventsPageState = atom<number>({
  key: 'poolEventsPageState',
  default: 0,
});

const poolEventsPageSizeState = atom<number>({
    key: 'poolEventsPageSizeState',
    default: 10,
  });


// --- Selectors ---

const borrowerSelector = selector<PoolLendingBorrower | null>({
    key: 'borrowerSelector',
    get: ({ get }) => get(borrowerState),
});

const borrowerEventsSelector = selector<PoolLendingBorrowerEvents[]>({
    key: 'borrowerEventsSelector',
    get: ({ get }) => get(borrowerEventsState),
});

const contributorSelector = selector<PoolLendingContributor | null>({
    key: 'contributorSelector',
    get: ({ get }) => get(contributorState),
});

const contributorEventsSelector = selector<PoolLendingContributorEvents[]>({
    key: 'contributorEventsSelector',
    get: ({ get }) => get(contributorEventsState),
});


const poolEventsSelector = selector<{ content: PoolLendingPoolEvents[]; totalPages: number; totalElements: number }>({
    key: 'poolEventsSelector',
    get: ({ get }) => get(poolEventsState),
});

const poolEventsPageSelector = selector<number>({
    key: 'poolEventsPageSelector',
    get: ({ get }) => get(poolEventsPageState),
});

const poolEventsPageSizeSelector = selector<number>({
    key: 'poolEventsPageSizeSelector',
    get: ({ get }) => get(poolEventsPageSizeState),
});


// --- Value Hook ---

export const usePoolLendingValues = () => {
    return {
        borrower: useRecoilValue(borrowerSelector),
        borrowerEvents: useRecoilValue(borrowerEventsSelector),
        contributor: useRecoilValue(contributorSelector),
        contributorEvents: useRecoilValue(contributorEventsSelector),
        poolEvents: useRecoilValue(poolEventsSelector),
        poolEventsPage: useRecoilValue(poolEventsPageSelector),
        poolEventsPageSize: useRecoilValue(poolEventsPageSizeSelector),
    };
};


// --- Action Hook ---

let isInitialized = false;

export const usePoolLendingActions = () => {
    // --- Borrower State ---
    const [borrower, setBorrower] = useRecoilState(borrowerState);
    const [borrowerEvents, setBorrowerEvents] = useRecoilState(borrowerEventsState);

    // --- Contributor State ---
    const [contributor, setContributor] = useRecoilState(contributorState);
    const [contributorEvents, setContributorEvents] = useRecoilState(contributorEventsState);

    // --- Pool Events State ---
    const [poolEvents, setPoolEvents] = useRecoilState(poolEventsState);
    const [poolEventsPage, setPoolEventsPage] = useRecoilState(poolEventsPageState);
    const [poolEventsPageSize, setPoolEventsPageSize] = useRecoilState(poolEventsPageSizeState);

    const fetchBorrower = async (borrowerAddress: string) => {
        try {
            const data = await getBorrowerByAddress(borrowerAddress);
            setBorrower(data);
        } catch (error) {
            console.error("Error fetching borrower data:", error);
            setBorrower(null);
        }
    };

    const fetchBorrowerEvents = async (borrowerAddress: string) => {
        try {
            const data = await getBorrowerEventsByBorrowerAddress(borrowerAddress);
            setBorrowerEvents(data);
        } catch (error) {
            console.error("Error fetching borrower events:", error);
            setBorrowerEvents([]);
        }
    };

    const fetchContributor = async (contributorAddress: string) => {
        try {
            const data = await getContributorByAddress(contributorAddress);
            setContributor(data);
        } catch (error) {
            console.error("Error fetching contributor data:", error);
            setContributor(null);
        }
    };

    const fetchContributorEvents = async (contributorAddress: string) => {
        try {
            const data = await getContributorEventsByContributorAddress(contributorAddress);
            setContributorEvents(data);
        } catch (error) {
            console.error("Error fetching contributor events:", error);
            setContributorEvents([]);
        }
    };

    const fetchPoolEvents = async () => {
        try {
          const data = await getAllPoolEvents(poolEventsPage, poolEventsPageSize);
          setPoolEvents(data);
        } catch (error) {
          console.error('Error fetching pool events:', error);
          setPoolEvents({content: [], totalPages: 0, totalElements: 0});
        }
      };
    
    const init = async () => {
        if (!isInitialized) {
          await Promise.all([
            fetchPoolEvents()
          ]);
            isInitialized = true;
        }
    }
    const onLogin = async (address: string) => {
        await Promise.all([
        fetchBorrower(address),
        fetchBorrowerEvents(address),
        fetchContributor(address),
        fetchContributorEvents(address),
        fetchPoolEvents()
        ]);
    };


    const setPage = (page: number) => {
      setPoolEventsPage(page)
    }

    const setPageSize = (size: number) => {
       setPoolEventsPageSize(size)
    }

    const onLogout = () => {
        setBorrower(null);
        setBorrowerEvents([]);
        setContributor(null);
        setContributorEvents([]);
    }

      

    return {
        fetchBorrower,
        fetchBorrowerEvents,
        fetchContributor,
        fetchContributorEvents,
        fetchPoolEvents,
        init,
        setPage,
        setPageSize,
        onLogin,
        onLogout,
    };
};