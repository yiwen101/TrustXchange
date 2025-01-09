// src/components/RequestManager.tsx

import React, { useState } from 'react';
import ApproveTransaction from './TransactionProgress';

export interface NewRequestFormProps {
    open: boolean;
    onSubmit: (callback: () => Promise<void>) => void;
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

    const onFormSubmit = (callback: () => Promise<void>) => {
        setCallback(callback);
        setIsFormSubmitted(true);
    }

    return (
        <>
        {isWindowOpen && !isFormSubmitted && (<RequestForm open={isWindowOpen} onClose={closeWindow} onSubmit={onFormSubmit} />)}
        {isWindowOpen && isFormSubmitted  && (<ApproveTransaction onApprove={callback} onClose={closeWindow} />)}
        </>
    );
};

export default RequestManager;