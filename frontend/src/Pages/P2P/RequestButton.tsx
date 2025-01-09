import React, { useState } from 'react';
import {
  Button,
} from '@mui/material';
import NewRequestForm from './p2pRequestForm';
import RequestManager from '../../Component/RequestManager';
import {XRP_LENDING_P2P} from "../../const"
import { useConnectedWalletActions, useConnectedWalletValues } from '../../hooks/useConnectedWallet';

const RequestButton: React.FC = () => {
    const {connectedWallet} = useConnectedWalletValues();
    const {connectOrCreateWallet} = useConnectedWalletActions();
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    };

    return (
    <>
        {connectedWallet && (
        <Button variant="contained" color="primary" style={{marginTop: '10px'}} onClick={() => handleClickOpen()}>
            Submit New Borrowing/Lending Request
        </Button>)}
        {!connectedWallet && (
        <Button variant="contained" color="primary" style={{marginTop: '10px'}} onClick={() => connectOrCreateWallet()}>
            Connect Wallet
        </Button>)}
        <RequestManager isWindowOpen={open} closeWindow={handleClose} RequestForm={NewRequestForm} contractAddress={XRP_LENDING_P2P}/>
    </>
    );
}

export default RequestButton;