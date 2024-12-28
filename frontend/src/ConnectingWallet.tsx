// src/ConnectedWallet.tsx
import React from 'react';
import { Typography, Stack} from '@mui/material';
import { InvisibleIcon } from './icons/Icons';

export const ConnectingWallet = () => {
    return (
        <Stack direction="row" alignItems="center" spacing={0} style={{ cursor: 'pointer' }}>
            <InvisibleIcon />
            <Typography variant="body2" noWrap>
                Connecting...
            </Typography>
        </Stack>
    );
}  

export default ConnectingWallet;