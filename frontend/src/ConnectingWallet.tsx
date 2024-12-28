// src/ConnectedWallet.tsx
import { Button } from '@mui/material';
import React from 'react';

export const ConnectingWallet = () => {
    return (
        <Button
        variant="contained"
        color="warning"
        size="small"
        sx={{
          borderRadius: '20px',
          textTransform: 'none',
          minWidth: '150px', 
        }}
      >
        Connecting Wallet...
      </Button>
    );
}  

export default ConnectingWallet;