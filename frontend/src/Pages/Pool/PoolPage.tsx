import React, { useState } from 'react';
import { Card, Button, Typography, Box, Stack } from '@mui/material';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import { useConnectedWalletValues, useConnectedWalletActions } from '../../hooks/useConnectedWallet';
import { useXrpPriceValue } from '../../hooks/usePriceState';
import xrp_api from '../../api/xrp';
import PieInfo from '../../Component/PieInfo';
import InputCard from '../Swap/InputCard';
import { useThreadPool } from '../../utils';

const PoolPage = () => {
  const { connectedWallet, connectionStatus, walletAMMnStatus } = useConnectedWalletValues();
  const { ammInfo } = useXrpPriceValue();
  const [xrpValueInput, setXrpValueInput] = useState('');
  const [usdValueInput, setUsdValueInput] = useState('');
  const [dp, setDp] = useState(2);
  const [isAdding, setIsAdding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const threadPool = useThreadPool(8);
  const [inputError, setInputError] = useState('');
  const { withdrawFromPool, contributeToPool } = useConnectedWalletActions();

  const handleXrpValueChange = (value: string) => {
    setInputError('');
    if (value === '') {
      setXrpValueInput('');
      setUsdValueInput('');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setInputError('Please enter a valid amount');
      return;
    }
    
    if (ammInfo && value) {
      try {
        const usd_can_add = xrp_api.get_usd_can_get_with_xrp(numValue, ammInfo);
        setUsdValueInput(usd_can_add.toFixed(dp));
      } catch (error) {
        setInputError('Error calculating amounts');
      }
    }
    setXrpValueInput(value);
  };

  const handleUsdValueChange = (value: string) => {
    if (parseFloat(value) < 0) return;
    
    if (ammInfo && value) {
      const xrp_can_add = xrp_api.get_xrp_needed_for_usd(parseFloat(value), ammInfo);
      setXrpValueInput(xrp_can_add.toFixed(dp));
    }
    setUsdValueInput(value);
  };

  const handleAddLiquidity = async () => {
    if (connectionStatus !== 'connected' || !connectedWallet) return;
    if (!ammInfo) return;

    const xrpAmount = parseFloat(xrpValueInput);
    const usdAmount = parseFloat(usdValueInput);
    if (isNaN(xrpAmount) || isNaN(usdAmount) || xrpAmount <= 0 || usdAmount <= 0) {
      return;
    }

    try {
      setIsAdding(true);
      await contributeToPool(xrpAmount, usdAmount);
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

  const handleWithdraw = async () => {
    if (!connectedWallet) return;
    try {
      setIsWithdrawing(true);
      await withdrawFromPool();
      alert('Successfully withdrawn from pool');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw: ' + (error as Error).message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Card style={{ padding: '20px', width: '300px', margin: 'auto' }}>
      <PieInfo usd_amount={ammInfo?.usd_amount || 0} xrp_amount={ammInfo?.xrp_amount || 0} />
      <Box mt={3}>
        <Typography variant="h6">Add Liquidity</Typography>
        <InputCard
          icon={<XrpIcon />}
          value={xrpValueInput}
          onChange={handleXrpValueChange}
          error={!!inputError}
          helperText={inputError}
        />
        <InputCard
          icon={<UsdcIcon />}
          value={usdValueInput}
          onChange={handleUsdValueChange}
          error={!!inputError}
          helperText={inputError}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddLiquidity}
          style={{ marginTop: '10px', width: "100%" }}
          disabled={connectionStatus !== 'connected' || isAdding || !!inputError}
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

      {connectedWallet && walletAMMnStatus && walletAMMnStatus.user_share > 0 && (
        <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1}>
          <Typography variant="body2">
            Your Position: {(walletAMMnStatus.user_share * 100).toFixed(2)}%
          </Typography>
          <Typography variant="body2">
            {walletAMMnStatus.xrp_claimable.toFixed(6)} XRP
          </Typography>
          <Typography variant="body2" mb={1}>
            {walletAMMnStatus.usd_claimable.toFixed(6)} USD
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            fullWidth
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw All'}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default PoolPage;