import React, { useEffect, useState, useRef } from 'react';
import { Grid, Typography, Container, Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useP2pValues, useP2pActions } from '../../hooks/useP2pLendingState';
import P2pRequestCard from './components/P2pRequestCard';
import { styled } from '@mui/material/styles';
import { useConnectedWalletValues } from '../../hooks/useConnectedWallet';

import ShareIcon from '@mui/icons-material/Share';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';


const StickyTradeSection = styled(Box)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'rgb(236,236,238)',
    padding: theme.spacing(1),
    zIndex: 100,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
}));



const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                marginRight: theme.spacing(1.5),
                fontSize: 20,
            },
            '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
            },
             '&:active': {
                  backgroundColor: theme.palette.action.selected,
            },
        },
    },
}));


const TradeSection: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const tradeButtonRef = useRef<HTMLButtonElement>(null);

  const handleTradeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(tradeButtonRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

    const handleMenuItemClick = (action:string) => {
        alert(`perform ${action} action`);
        handleClose();
    }
  return (
    <StickyTradeSection>
      <IconButton aria-label="share" color="primary">
        <ShareIcon />
      </IconButton>
      <IconButton aria-label="watchlist" color="primary">
        <PlaylistAddCheckIcon />
      </IconButton>
      <Button
        ref={tradeButtonRef}
        onClick={handleTradeClick}
        endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        variant="contained"
      >
        Trade
      </Button>
        <StyledMenu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
        >
            <MenuItem onClick={() => handleMenuItemClick('buy/sell')}>Buy/Sell</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('short')}>Short</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('issue')}>Issue</MenuItem>
        </StyledMenu>
    </StickyTradeSection>
  );
};


const P2pMarketplace: React.FC = () => {
    const { borrowingRequests, lendingRequests } = useP2pValues();
    const { init } = useP2pActions();
    const { connectedWallet } = useConnectedWalletValues();

    useEffect(() => {
        init();
    }, [init]);

    const handleAcceptRequest = (requestId: number) => {
        console.log(`Accepting request ${requestId}`);
    };


    // Filter out already matched requests
    const unfilledBorrowRequests = borrowingRequests.filter(req => req.amountBorrowedUsd === 0);
    const unfilledLendRequests = lendingRequests.filter(req => req.amountLendedUsd === 0);

    return (
        <Container >
            <Typography variant="h4" gutterBottom>
                P2P Lending Marketplace
            </Typography>
            <Typography variant="h6" gutterBottom>
                Unfilled Borrow Requests
            </Typography>
            <Grid container spacing={3}>
                {unfilledBorrowRequests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} key={request.requestId}>
                        <P2pRequestCard request={request} type="borrow" onAccept={handleAcceptRequest}/>
                    </Grid>
                ))}
            </Grid>
            <Typography variant="h6" gutterBottom>
                Unfilled Lending Requests
            </Typography>
            <Grid container spacing={3}>
                {unfilledLendRequests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} key={request.requestId}>
                        <P2pRequestCard request={request} type="lend"  onAccept={handleAcceptRequest}/>
                    </Grid>
                ))}
            </Grid>

             <TradeSection />

        </Container>
    );
};

export default P2pMarketplace;