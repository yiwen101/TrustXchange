// src/components/RequestManager.tsx

import React, { useState } from 'react';
import ApproveTransaction from './TransactionProgress';

export interface NewRequestFormProps {
    open: boolean;
    onSubmit: (callback: () => Promise<void>, currencyStr:string) => void;
    onClose: () => void;
}
interface RequestManagerProps {
    isWindowOpen: boolean;
    closeWindow: () => void;
    RequestForm: React.FC<NewRequestFormProps>;
}

const RequestManager: React.FC<RequestManagerProps> = (props) => {
    const {isWindowOpen, closeWindow, RequestForm} = props;
    const dummyCallback = async () => {};
    const [callback, setCallback] = useState<() => Promise<void>>(dummyCallback);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [currencyStr, setCurrencyStr] = useState('');

    const onFormSubmit = (callback: () => Promise<void>, currencyStr:string) => {
        setCallback(callback);
        setCurrencyStr(currencyStr);
        setIsFormSubmitted(true);
    }

    return (
        <>
        <RequestForm open={isWindowOpen && !isFormSubmitted} onClose={closeWindow} onSubmit={onFormSubmit} />
        <ApproveTransaction open = {isWindowOpen && isFormSubmitted} onClose={closeWindow} onApprove={callback}  currencyStr={currencyStr} onBack={() => setIsFormSubmitted(false)} />
        </>
    );
};

export default RequestManager;