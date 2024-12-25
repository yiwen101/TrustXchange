// src/WebsiteNavbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import CompanyName from './CompanyName'; // Adjust the import path as needed

function WebsiteNavbar() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <CompanyName />
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/wallet">
            Wallet
          </Button>
        </Box>
        <Button 
  variant="contained" 
  color="secondary" 
  size="large"
  sx={{ 
    borderRadius: '20px', 
    textTransform: 'none',
    ml: 2 
  }}
>
  Login
</Button>
      </Toolbar>
    </AppBar>
  );
}

export default WebsiteNavbar;