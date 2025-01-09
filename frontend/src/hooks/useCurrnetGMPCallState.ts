// hooks/useP2p.ts
import { atom, useRecoilState } from 'recoil';

export const XrplTransaction = atom<string|null>({
    key: 'XRPL_TRANSACTION',
    default: null,
});

export const GatewayTransaction = atom<string|null>({
    key: 'GATEWAY_TRANSACTION',
    default: null,
});

export const EvmTransaction = atom< string|null>({
    key: 'EVM_TRANSACTION',
    default: null,
});


export const useCurrentGMPCallState = () => {
    const [xrplTransaction, setXrplTransaction] = useRecoilState(XrplTransaction);
    const [evmTransaction, setEvmTransaction] = useRecoilState(EvmTransaction);
    const [gatewayTransaction, setGatewayTransaction] = useRecoilState(GatewayTransaction);

    return { 
        xrplTransaction,
        evmTransaction,
        gatewayTransaction,
        reset: () => {
            setXrplTransaction(null);
            setEvmTransaction(null);
            setGatewayTransaction(null);
        },
        setXrplTransaction,
        setEvmTransaction,
        setGatewayTransaction,
    }
};