import React, { useState } from 'react';
import { Card, Button, Typography, Stack } from '@mui/material';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import InputCard from '../Swap/InputCard';
import { useXrpPriceValue } from '../../hooks/usePriceState';
import { useConnectedWalletValues, useConnectedWalletActions } from '../../hooks/useConnectedWallet';
import { add_usd_to_XRP_USDC_AMM, add_xrp_to_XRP_USDC_AMM } from '../../api/xrp/amm_transection';

const ContributePage = () => {
  const [usdValueInput, setUsdValueInput] = useState('');
  const [xrpValueInput, setXrpValueInput] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const { ammInfo } = useXrpPriceValue();
  const { connectedWallet } = useConnectedWalletValues();
  const { connectOrCreateWallet } = useConnectedWalletActions();

  const handleUsdValueChange = (value: string) => {
    setUsdValueInput(value);
    // Calculate equivalent XRP based on pool ratio
    if (ammInfo && value) {
      const usdAmount = parseFloat(value);
      const ratio = ammInfo.xrp_amount / ammInfo.usd_amount;
      const xrpAmount = usdAmount * ratio;
      setXrpValueInput(xrpAmount.toFixed(2));
    }
  };

  const handleXrpValueChange = (value: string) => {
    setXrpValueInput(value);
    // Calculate equivalent USD based on pool ratio
    if (ammInfo && value) {
      const xrpAmount = parseFloat(value);
      const ratio = ammInfo.usd_amount / ammInfo.xrp_amount;
      const usdAmount = xrpAmount * ratio;
      setUsdValueInput(usdAmount.toFixed(2));
    }
  };

  const handleContribute = async () => {
    if (!connectedWallet || !ammInfo) {
      return;
    }

    try {
      setIsContributing(true);
      const usdAmount = parseFloat(usdValueInput);
      const xrpAmount = parseFloat(xrpValueInput);

      if (isNaN(usdAmount) || isNaN(xrpAmount)) {
        throw new Error('Invalid input amounts');
      }

      // Add both USD and XRP to maintain pool ratio
      await Promise.all([
        add_usd_to_XRP_USDC_AMM(connectedWallet, usdAmount),
        add_xrp_to_XRP_USDC_AMM(connectedWallet, xrpAmount)
      ]);

      // Clear inputs after successful contribution
      setUsdValueInput('');
      setXrpValueInput('');
      alert('Contribution successful!');
    } catch (error) {
      console.error('Contribution failed:', error);
      alert('Contribution failed: ' + (error as Error).message);
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <Card style={{ padding: '20px', width: '250px', margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>Contribute Liquidity</Typography>
      
      <InputCard 
        icon={<UsdcIcon />}
        value={usdValueInput}
        onChange={handleUsdValueChange}
        disabled={!connectedWallet || isContributing}
      />

      <InputCard 
        icon={<XrpIcon />}
        value={xrpValueInput}
        onChange={handleXrpValueChange}
        disabled={!connectedWallet || isContributing}
      />

      {ammInfo && (
        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
          Pool Ratio: 1 USD = {(ammInfo.xrp_amount / ammInfo.usd_amount).toFixed(4)} XRP
        </Typography>
      )}

      <Button 
        variant="contained" 
        color="primary" 
        fullWidth
        onClick={connectedWallet ? handleContribute : connectOrCreateWallet}
        disabled={isContributing || (!connectedWallet && isContributing)}
      >
        {!connectedWallet ? 'Connect Wallet' : 
         isContributing ? 'Contributing...' : 'Contribute'}
      </Button>

      {ammInfo && (
        <Card style={{ padding: '10px', marginTop: '20px' }}>
          <Typography variant="h6" gutterBottom>Pool Info</Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              USD in Pool: ${ammInfo.usd_amount.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              XRP in Pool: {ammInfo.xrp_amount.toFixed(2)} XRP
            </Typography>
          </Stack>
        </Card>
      )}
    </Card>
  );
};

export default ContributePage; 