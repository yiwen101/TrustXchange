import React from 'react';
import { AppBar, Container, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ConnectWalletButton from './ConnectWalletButton';

const NavBar: React.FC = () => {
  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'SWAP', path: '/swap' },
    { label: 'POOL', path: '/pool' },
    { label: 'PLEDGE', path: '/pledge' },
    { label: 'P2P', path: '/p2p' },
    { label: 'FUTURE', path: '/future' },
    { label: 'WALLET', path: '/wallet' }
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            trustXchange
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {navItems.map((page) => (
              <Button
                key={page.label}
                component={Link}
                to={page.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          <ConnectWalletButton />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar; 