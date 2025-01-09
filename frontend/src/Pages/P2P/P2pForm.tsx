import React, { useState } from 'react';
import {
  Button,
} from '@mui/material';
import NewRequestForm from './p2pRequestForm';
import RequestManager from '../../Component/RequestManager';
import {XRP_LENDING_P2P} from "../../const"

const RequestButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    };

    return (
    <>
        <Button variant="contained" color="primary" style={{marginTop: '10px'}} onClick={() => handleClickOpen()}>
            Submit New Borrowing/Lending Request
        </Button>
        <RequestManager isWindowOpen={open} closeWindow={handleClose} RequestForm={NewRequestForm} contractAddress={XRP_LENDING_P2P}/>
    </>
    );
}

export default RequestButton;