// src/WebsiteNavbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import CompanyName from './CompanyName'; // Adjust the import path as needed
import { useConnectedWalletValues } from './hooks/useConnectedWallet';
import ConnectWalletButton from './ConnectWalletButton';
import { ConnectedWallet } from './ConnectedWallet';
import ConnectingWallet from './ConnectingWallet';

function WebsiteNavbar() {
  const { connectionStatus } = useConnectedWalletValues();
  return (
    <Box>
    <AppBar position="fixed">
      <Toolbar>
        <CompanyName />
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/future">
            Future
          </Button>
          <Button color="inherit" component={Link} to="/p2p">
            P2P
          </Button>
          <Button color="inherit" component={Link} to="/pool">
            Pool
          </Button>
          <Button color="inherit" component={Link} to="/swap">
            Swap
          </Button>
          <Button color="inherit" component={Link} to="/wallet">
            Wallet
          </Button>
          <Button color="inherit" component={Link} to="/dev">
            Dev
          </Button>
        </Box>
        {connectionStatus === "disconnected" && <ConnectWalletButton />}
        {connectionStatus === "connecting" && <ConnectingWallet />}
        {connectionStatus === "connected" && <ConnectedWallet />}
      </Toolbar>
    </AppBar>
    <Box height="65px" />
    </Box>
  );
}

export default WebsiteNavbar;