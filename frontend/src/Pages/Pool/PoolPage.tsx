import React, { useState } from 'react';
import { Card, Button, Typography, TextField, Box, Stack } from '@mui/material';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import { useConnectedWalletValues } from '../../hooks/useConnectedWallet';
import { useXrpPriceValue } from '../../hooks/usePriceState';
import xrp_api from '../../api/xrp';
import PieInfo from '../../Component/PieInfo';
import { add_usd_to_XRP_USDC_AMM, add_xrp_to_XRP_USDC_AMM } from '../../api/xrp/amm_transection';

const PoolPage = () => {
  const { connectedWallet, connectionStatus } = useConnectedWalletValues();
  const { ammInfo } = useXrpPriceValue();
  const [xrpValueInput, setXrpValueInput] = useState('');
  const [usdValueInput, setUsdValueInput] = useState('');
  const [dp, setDp] = useState(2);
  const [isAdding, setIsAdding] = useState(false);

  const handleXrpValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (parseFloat(value) < 0) return;
    
    if (ammInfo && value) {
      const usd_can_add = xrp_api.get_usd_can_get_with_xrp(parseFloat(value), ammInfo);
      setUsdValueInput(usd_can_add.toFixed(dp));
    }
    setXrpValueInput(value);
  };

  const handleUsdValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (parseFloat(value) < 0) return;
    
    if (ammInfo && value) {
      const xrp_can_add = xrp_api.get_xrp_needed_for_usd(parseFloat(value), ammInfo);
      setXrpValueInput(xrp_can_add.toFixed(dp));
    }
    setUsdValueInput(value);
  };

  const handleAddLiquidity = async () => {
    if (connectionStatus !== 'connected' || !connectedWallet) {
      console.log('No connected wallet');
      return;
    }

    if (!ammInfo) {
      console.log('AMM data unavailable');
      return;
    }

    const xrpAmount = parseFloat(xrpValueInput);
    const usdAmount = parseFloat(usdValueInput);
    if (isNaN(xrpAmount) || isNaN(usdAmount) || xrpAmount <= 0 || usdAmount <= 0) {
      alert('Invalid input amounts');
      return;
    }

    try {
      setIsAdding(true);
      
      // Add both USD and XRP to maintain pool ratio
      await Promise.all([
        add_usd_to_XRP_USDC_AMM(connectedWallet, usdAmount),
        add_xrp_to_XRP_USDC_AMM(connectedWallet, xrpAmount)
      ]);

      // Reset inputs after successful addition
      setXrpValueInput('');
      setUsdValueInput('');
      alert('Successfully added liquidity to pool');
    } catch (error) {
      console.error('Error adding liquidity:', error);
      alert('Failed to add liquidity: ' + (error as Error).message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card style={{ padding: '20px', width: '300px', margin: 'auto' }}>
      <PieInfo usd_amount={ammInfo?.usd_amount || 0} xrp_amount={ammInfo?.xrp_amount || 0} />
      <Box mt={3}>
        <Typography variant="h6">Add Liquidity</Typography>
        <TextField
          label="XRP Amount"
          type="number"
          value={xrpValueInput}
          onChange={handleXrpValueChange}
          InputProps={{
            startAdornment: <Box mr={1}><XrpIcon /></Box>,
            inputProps: { min: "0" }
          }}
          fullWidth
          margin="normal"
          disabled={isAdding}
        />
        <TextField
          label="USD Amount"
          type="number"
          value={usdValueInput}
          onChange={handleUsdValueChange}
          InputProps={{
            startAdornment: <Box mr={1}><UsdcIcon /></Box>,
            inputProps: { min: "0" }
          }}
          fullWidth
          margin="normal"
          disabled={isAdding}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddLiquidity}
          style={{ marginTop: '10px', width: "100%" }}
          disabled={connectionStatus !== 'connected' || isAdding}
        >
          {connectionStatus !== 'connected' ? 'Connect Wallet' : 
           isAdding ? 'Adding Liquidity...' : 'Add Liquidity'}
        </Button>

        {ammInfo && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Pool Ratio: 1 USD = {(ammInfo.xrp_amount / ammInfo.usd_amount).toFixed(4)} XRP
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default PoolPage;