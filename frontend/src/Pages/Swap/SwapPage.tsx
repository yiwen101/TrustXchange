// SwapPage.tsx
import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  IconButton, 
  Typography, 
  Stack, 
  Box,
  Container,
  ButtonGroup,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import InputCard from './InputCard';
import xrp_api from '../../api/xrp';
import { useXrpPriceValue } from '../../hooks/usePriceState';
import { useConnectedWalletValues, useConnectedWalletActions } from '../../hooks/useConnectedWallet';

const SwapPage = () => {
  const [usdValueInput, setUsdValueInput] = useState('');
  const [xrpValueInput, setXrpValueInput] = useState('');
  const [isXrpToUsd, setIsXrpToUsd] = useState(true);
  const [dp, setDp] = useState(2);
  const [isSwapping, setIsSwapping] = useState(false);
  const { xrpPrice, xrpPriceYesterday, ammInfo } = useXrpPriceValue();
  const { connectedWallet } = useConnectedWalletValues();
  const { swapForXrp, swapForUsd, connectOrCreateWallet } = useConnectedWalletActions();
  const [maxSlippageTolerance, setMaxSlippageTolerance] = useState(0.5); // Default 0.5%
  const [inputError, setInputError] = useState('');

  // Add slippage options
  const slippageOptions = [0.1, 0.5, 1.0];

  const handleSwitch = () => {
    setIsXrpToUsd(!isXrpToUsd);
    setUsdValueInput('')
    setXrpValueInput('')
  };

  const handleXrpValueChange = (value: string) => {
    setInputError('');
    if (value === '') {
      setXrpValueInput('');
      setUsdValueInput('');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setInputError('Please enter a valid number');
      return;
    }

    const max_tradable_usd = ammInfo!.usd_amount-10;
    const max_tradable_xrp = ammInfo!.xrp_amount-10;
    if (isXrpToUsd) {
      const usd_can_get = xrp_api.get_usd_can_get_with_xrp(parseFloat(value),ammInfo!);
      if (usd_can_get.toNumber() > max_tradable_usd-1) {
        setUsdValueInput(max_tradable_usd.toFixed(dp));
        const xrp_required = xrp_api.get_xrp_needed_for_usd(max_tradable_usd,ammInfo!);
        setXrpValueInput(xrp_required.toFixed(dp));
        return
      }
      setUsdValueInput(usd_can_get.toFixed(dp));
    } else {
      if (numValue > max_tradable_xrp-1) {
        const usd_needed = xrp_api.get_usd_needed_for_xrp(max_tradable_xrp,ammInfo!);
        setXrpValueInput(max_tradable_xrp.toFixed(dp));
        setUsdValueInput(usd_needed.toFixed(dp));
        return
      }
      const usd_can_get = xrp_api.get_usd_needed_for_xrp(parseFloat(value),ammInfo!);
      setUsdValueInput(usd_can_get.toFixed(dp));
    }
    setXrpValueInput(value)
  }

  const handleUsdValueChange = (value: string) => {
    setInputError('');
    if (value === '') {
      setXrpValueInput('');
      setUsdValueInput('');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setInputError('Please enter a valid number');
      return;
    }

    const max_tradable_usd = ammInfo!.usd_amount-10;
    const max_tradable_xrp = ammInfo!.xrp_amount-10;
    if (isXrpToUsd) {
      if (numValue > max_tradable_usd) {
        const xrp_required = xrp_api.get_xrp_needed_for_usd(max_tradable_usd,ammInfo!);
        setXrpValueInput(xrp_required.toFixed(dp));
        setUsdValueInput(max_tradable_usd.toFixed(dp));
        return
      }
      const xrp_required = xrp_api.get_xrp_needed_for_usd(parseFloat(value),ammInfo!);
      setXrpValueInput(xrp_required.toFixed(dp));
      
    } else {
      const xrp_can_get = xrp_api.get_xrp_needed_for_usd(parseFloat(value),ammInfo!);
      if (xrp_can_get.toNumber() > max_tradable_xrp) {
        const usd_needed = xrp_api.get_usd_needed_for_xrp(max_tradable_xrp,ammInfo!);
        setXrpValueInput(max_tradable_xrp.toFixed(dp));
        setUsdValueInput(usd_needed.toFixed(dp));
        return
      }
      setXrpValueInput(xrp_can_get.toFixed(dp));
    }
    setUsdValueInput(value);
  }

  const handleSwap = async () => {
    if (!connectedWallet || !ammInfo) {
      return;
    }

    try {
      const usdAmount = parseFloat(usdValueInput);
      const xrpAmount = parseFloat(xrpValueInput);
      
      if (isNaN(usdAmount) || isNaN(xrpAmount)) {
        throw new Error('Invalid input amounts');
      }

      // Show confirmation dialog with slippage info
      const confirmed = window.confirm(
        `You are swapping:\n` +
        `${isXrpToUsd ? xrpAmount + ' XRP → ' + usdAmount + ' USD' : usdAmount + ' USD → ' + xrpAmount + ' XRP'}\n` +
        `Maximum slippage tolerance: ${maxSlippageTolerance}%\n` +
        `The swap will be attempted with the lowest possible slippage, starting from 0%\n` +
        `Continue with swap?`
      );

      if (!confirmed) return;

      setIsSwapping(true);
      
      if (isXrpToUsd) {
        // When swapping XRP to USD, xrpAmount is what we're sending, usdAmount is what we expect to receive
        await swapForXrp(xrpAmount, usdAmount, maxSlippageTolerance);
      } else {
        // When swapping USD to XRP, usdAmount is what we're sending, xrpAmount is what we expect to receive
        await swapForUsd(usdAmount, xrpAmount, maxSlippageTolerance);
      }

      setUsdValueInput('');
      setXrpValueInput('');
      alert('Swap successful!');
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed: ' + (error as Error).message);
    } finally {
      setIsSwapping(false);
    }
  };

  const current_price_2dp = xrpPrice ? xrpPrice.toFixed(2) : '0.00'
  const price_diff = xrpPrice && xrpPriceYesterday ? xrpPrice - xrpPriceYesterday : 0
  const price_diff_2dp = price_diff.toFixed(2)

  const handleSlippageChange = (value: number) => {
    setMaxSlippageTolerance(value);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(121, 134, 203, 0.05) 100%),
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 20px 20px, 20px 20px',
        pt: 4,
        pb: 8
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#1976d2' }}>
            Swap
          </Typography>

          {/* Slippage Settings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Maximum Slippage Tolerance
            </Typography>
            <ButtonGroup 
              size="small" 
              sx={{ 
                '& .MuiButton-root': {
                  borderColor: 'rgba(25, 118, 210, 0.12)',
                  px: 3,
                  transition: 'all 0.2s'
                }
              }}
            >
              {[0.1, 0.5, 1.0].map((value) => (
                <Button
                  key={value}
                  variant={maxSlippageTolerance === value ? "contained" : "outlined"}
                  onClick={() => handleSlippageChange(value)}
                  sx={{ 
                    minWidth: '60px',
                    bgcolor: maxSlippageTolerance === value ? '#1976d2' : 'transparent',
                    color: maxSlippageTolerance === value ? 'white' : '#1976d2',
                    '&:hover': {
                      bgcolor: maxSlippageTolerance === value ? '#1565c0' : 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  {value}%
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {/* Swap Inputs */}
          <Stack spacing={2}>
            {isXrpToUsd ? (
              <InputCard 
                icon={<XrpIcon />} 
                value={xrpValueInput} 
                onChange={handleXrpValueChange}
                error={!!inputError}
                helperText={inputError}
                label="You pay"
              />
            ) : (
              <InputCard 
                icon={<UsdcIcon />} 
                value={usdValueInput} 
                onChange={handleUsdValueChange}
                error={!!inputError}
                helperText={inputError}
                label="You pay"
              />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <IconButton 
                onClick={handleSwitch}
                sx={{ 
                  bgcolor: 'background.default',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <SwapVertIcon />
              </IconButton>
            </Box>

            {isXrpToUsd ? (
              <InputCard 
                icon={<UsdcIcon />} 
                value={usdValueInput} 
                onChange={handleUsdValueChange}
                error={!!inputError}
                helperText={inputError}
                label="You receive"
              />
            ) : (
              <InputCard 
                icon={<XrpIcon />} 
                value={xrpValueInput} 
                onChange={handleXrpValueChange}
                error={!!inputError}
                helperText={inputError}
                label="You receive"
              />
            )}
          </Stack>

          {/* Swap Button */}
          <Button 
            variant="contained" 
            fullWidth
            size="large"
            onClick={connectedWallet ? handleSwap : connectOrCreateWallet}
            disabled={isSwapping || (!connectedWallet && isSwapping) || !!inputError || !xrpValueInput || !usdValueInput}
            sx={{ 
              mt: 3,
              height: '48px',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(25, 118, 210, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {!connectedWallet ? 'Connect Wallet' : 
             isSwapping ? 'Swapping...' : 'Swap'}
          </Button>

          {/* Market Condition */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
              Market Condition
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 2,
                bgcolor: 'rgba(25, 118, 210, 0.02)',
                borderColor: 'rgba(25, 118, 210, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <XrpIcon sx={{ width: 28, height: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  {current_price_2dp}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ 
                  color: price_diff > 0 ? 'success.main' : 'error.main',
                  fontWeight: 500
                }}
              >
                {price_diff > 0 ? '+' : ''}{price_diff_2dp} since yesterday
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SwapPage;