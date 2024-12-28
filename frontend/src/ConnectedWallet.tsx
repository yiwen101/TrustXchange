import { Typography, Popover, Stack, Button } from '@mui/material';
import {  XrpFaucetIcon } from './icons/Icons';
import { useConnectedWalletActions } from './hooks/useConnectedWallet';
import React from 'react';

export const ConnectedWallet = () => {
    const {  disconnectWallet, getTruncatedAddress} = useConnectedWalletActions();
    const address = getTruncatedAddress();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMoreClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'connected-wallet-popover' : undefined;
    return (
        <Stack>
            <Stack direction="row" alignItems="center" spacing={0} onClick={handleMoreClick} style={{ cursor: 'pointer' }}>
                <XrpFaucetIcon />
                <Typography variant="body2" noWrap>
                    {address}
                </Typography>
            </Stack>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleMoreClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={0} width={'100%'} p={1}>
                <Button onClick={disconnectWallet} >
                    Disconnect
                </Button>
                </Stack>
            </Popover>
        </Stack>
    );
};