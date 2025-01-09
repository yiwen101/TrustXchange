import React, { useState } from 'react';
import {
  Button,
} from '@mui/material';
import NewRequestForm from './p2pRequestForm';
import RequestManager from '../../Component/RequestManager';

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
        <RequestManager isWindowOpen={open} closeWindow={handleClose} RequestForm={NewRequestForm} />
    </>
    );
}

export default RequestButton;