// hooks/useP2p.ts
import { atom, useRecoilState } from 'recoil';

export const XrplTransaction = atom<string>({
    key: 'XRPL_TRANSACTION',
    default: '',
});

export const EvmTransaction = atom< string>({
    key: 'EVM_TRANSACTION',
    default: '',
});


export const useCurrentGMPCallState = () => {
    const [xrplTransaction, setXrplTransaction] = useRecoilState(XrplTransaction);
    const [evmTransaction, setEvmTransaction] = useRecoilState(EvmTransaction);
    return { 
        xrplTransaction,
        evmTransaction,
        reset: () => {
            setXrplTransaction('');
            setEvmTransaction('');
        }
    }
};