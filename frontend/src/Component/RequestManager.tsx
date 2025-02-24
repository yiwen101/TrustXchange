// src/components/RequestManager.tsx

import React, { useState } from 'react';
import ApproveTransaction from './TransactionProgress';

export interface NewRequestFormProps {
    open: boolean;
    onSubmit: (callback: ()=>() => Promise<void>, currencyStr:string) => void;
    onClose: () => void;
}
interface RequestManagerProps {
    isWindowOpen: boolean;
    closeWindow: () => void;
    RequestForm: React.FC<NewRequestFormProps>;
    contractAddress: string;
}

const RequestManager: React.FC<RequestManagerProps> = (props) => {
    const {isWindowOpen, closeWindow, RequestForm,contractAddress} = props;
    const dummyCallback = async () => {};
    const [callback, setCallback] = useState<() => Promise<void>>(dummyCallback);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [currencyStr, setCurrencyStr] = useState('');

    const onFormSubmit = (callback: ()=>() => Promise<void>, currencyStr:string) => {
        setCallback(callback);
        setCurrencyStr(currencyStr);
        setIsFormSubmitted(true);
    }

    const onFinish = () => {
        setIsFormSubmitted(false);
        setCallback(dummyCallback);
        closeWindow();
    }

    return (
        <>
        <RequestForm open={isWindowOpen && !isFormSubmitted} onClose={closeWindow} onSubmit={onFormSubmit} />
        <ApproveTransaction open = {isWindowOpen && isFormSubmitted} onClose={onFinish} onApprove={callback}  currencyStr={currencyStr} onBack={() => setIsFormSubmitted(false)} contractAddress={contractAddress}/>
        </>
    );
};

export default RequestManager;