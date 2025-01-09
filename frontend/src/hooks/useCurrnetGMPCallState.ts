// hooks/useP2p.ts
import { atom, useRecoilState } from 'recoil';

export const XrplTransaction = atom<string|null>({
    key: 'XRPL_TRANSACTION',
    default: null,
});

export const EvmTransaction = atom< string|null>({
    key: 'EVM_TRANSACTION',
    default: null,
});


export const useCurrentGMPCallState = () => {
    const [xrplTransaction, setXrplTransaction] = useRecoilState(XrplTransaction);
    const [evmTransaction, setEvmTransaction] = useRecoilState(EvmTransaction);
    const beforeCallBackend = (hash:string) => {
        setXrplTransaction(hash);
    }
    const afterCallBackend = (hash:string) => {
        setEvmTransaction(hash);
    }

    return { 
        xrplTransaction,
        evmTransaction,
        reset: () => {
            setXrplTransaction(null);
            setEvmTransaction(null);
        },
        beforeCallBackend,
        afterCallBackend
    }
};