// SwapPage.tsx
import React from 'react';
import { Card, Button, IconButton, Typography, Stack, Alert, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import InputCard from './InputCard';
import { useXrpPriceValue } from '../../hooks/usePriceState';
import { useSwap } from '../../hooks/useSwap';

const SwapPage = () => {
  const { 
    usdValue,
    xrpValue,
    isXrpToUsd,
    error,
    success,
    isSwapping,
    handleXrpValueChange,
    handleUsdValueChange,
    handleSwitch,
    executeSwap,
    clearError,
    clearSuccess,
    canSwap,
    isLoading,
    showConfirmation,
    handleSwapClick,
    handleConfirmSwap,
    handleCancelSwap
  } = useSwap();

  const { xrpPrice, xrpPriceYesterday } = useXrpPriceValue();

  const current_price_2dp = xrpPrice ? xrpPrice.toFixed(2) : '0.00';
  const price_diff = xrpPrice && xrpPriceYesterday ? xrpPrice - xrpPriceYesterday : 0;
  const price_diff_2dp = price_diff.toFixed(2);

  return (
    <Card style={{ padding: '20px', width: '250px', margin: 'auto' }}>
      <Typography variant="h5">Swap</Typography>
      {isXrpToUsd ? (
        <InputCard icon={<XrpIcon />} value={xrpValue} onChange={handleXrpValueChange} />
      ) : (
        <InputCard icon={<UsdcIcon />} value={usdValue} onChange={handleUsdValueChange} />
      )}
      <IconButton onClick={handleSwitch} style={{ marginTop: '2px' }}>
        <SwapVertIcon />
      </IconButton>
      {isXrpToUsd ? (
        <InputCard icon={<UsdcIcon />} value={usdValue} onChange={handleUsdValueChange} />
      ) : (
        <InputCard icon={<XrpIcon />} value={xrpValue} onChange={handleXrpValueChange}/>
      )}
      <Button 
        variant="contained" 
        color="primary" 
        style={{ marginTop: '20px', width: '100%' }} 
        onClick={handleSwapClick}
        disabled={isSwapping || !usdValue || !xrpValue || !canSwap || isLoading}
      >
        {!canSwap ? 'Connect Wallet' : 
         isLoading ? <CircularProgress size={24} color="inherit" /> :
         isSwapping ? 'Swapping...' : 'Swap'}
      </Button>

      <Typography variant="h5" style={{ marginTop: '40px' }}>Market Condition</Typography>
      <Card style={{ padding: '10px', marginTop: '10px' }}>
        {xrpPrice && xrpPriceYesterday && (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <XrpIcon />
            <Typography variant="h6">{current_price_2dp}</Typography>
            <Typography
              variant="body2"
              style={{ color: price_diff>0 ? 'green' : 'red' }}
            >
              {price_diff_2dp} since yesterday
            </Typography>
        </Stack>)}
      </Card>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={clearError}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={clearSuccess}
      >
        <Alert severity="success">Swap successful!</Alert>
      </Snackbar>

      <Dialog open={showConfirmation} onClose={handleCancelSwap}>
        <DialogTitle>Confirm Swap</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              You will swap:
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography>From:</Typography>
              <Typography>
                {isXrpToUsd ? `${xrpValue} XRP` : `${usdValue} USD`}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>To:</Typography>
              <Typography>
                {isXrpToUsd ? `${usdValue} USD` : `${xrpValue} XRP`}
              </Typography>
            </Stack>
            <Typography variant="caption" color="textSecondary">
              Please confirm this transaction in your wallet
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSwap}>Cancel</Button>
          <Button onClick={handleConfirmSwap} color="primary">
            Confirm Swap
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SwapPage;