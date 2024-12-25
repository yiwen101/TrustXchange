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
    <AppBar position={'fixed'}>
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
          <Button color="inherit" component={Link} to="/pool">
            Pool
          </Button>
          <Button color="inherit" component={Link} to="/temp">
            Temp
          </Button>
          <Button color="inherit" component={Link} to="/p2p">
            P2P
          </Button>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
          }}
        >
          Connect Wallet
        </Button>
      </Toolbar>
    </AppBar>
  );
}

{/* fixed tabs 
<Box
        sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.paper',
          zIndex: 10,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          centered
        >
          <Tab label="Pool" />
          <Tab label="Action" />
        </Tabs>
      </Box>
  */}

export default WebsiteNavbar;