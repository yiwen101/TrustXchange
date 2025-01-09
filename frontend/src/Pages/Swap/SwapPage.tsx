// SwapPage.tsx
import React, { useState } from 'react';
import { Card, Button, IconButton, Typography, Stack, Box } from '@mui/material';
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
    <Card style={{ padding: '20px', width: '250px', margin: 'auto' }}>
      <Typography variant="h5">Swap</Typography>
      
      {/* Maximum slippage tolerance settings */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        my: 2,
        p: 1,
        border: '1px solid #eee',
        borderRadius: 1
      }}>
        <Typography variant="body2" gutterBottom>
          Maximum Slippage Tolerance
        </Typography>
        <Stack direction="row" spacing={1}>
          {slippageOptions.map((value) => (
            <Button
              key={value}
              size="small"
              variant={maxSlippageTolerance === value ? "contained" : "outlined"}
              onClick={() => handleSlippageChange(value)}
              sx={{ minWidth: '60px' }}
            >
              {value}%
            </Button>
          ))}
        </Stack>
      </Box>

      {isXrpToUsd ? (
        <InputCard 
          icon={<XrpIcon />} 
          value={xrpValueInput} 
          onChange={handleXrpValueChange}
          error={!!inputError}
          helperText={inputError}
        />
      ) : (
        <InputCard 
          icon={<UsdcIcon />} 
          value={usdValueInput} 
          onChange={handleUsdValueChange}
          error={!!inputError}
          helperText={inputError}
        />
      )}
      <IconButton onClick={handleSwitch} style={{ marginTop: '2px' }}>
        <SwapVertIcon />
      </IconButton>
      {isXrpToUsd ? (
        <InputCard 
          icon={<UsdcIcon />} 
          value={usdValueInput} 
          onChange={handleUsdValueChange}
          error={!!inputError}
          helperText={inputError}
        />
      ) : (
        <InputCard 
          icon={<XrpIcon />} 
          value={xrpValueInput} 
          onChange={handleXrpValueChange}
          error={!!inputError}
          helperText={inputError}
        />
      )}
      <Button 
        variant="contained" 
        color="primary" 
        style={{ marginTop: '20px', width: '100%' }}
        onClick={connectedWallet ? handleSwap : connectOrCreateWallet}
        disabled={isSwapping || (!connectedWallet && isSwapping) || !!inputError || !xrpValueInput || !usdValueInput}
      >
        {!connectedWallet ? 'Connect Wallet' : 
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
              style={{ color: price_diff > 0 ? 'green' : 'red' }}
            >
              {price_diff_2dp} since yesterday
            </Typography>
          </Stack>
        )}
      </Card>
    </Card>
  );
};

export default SwapPage;