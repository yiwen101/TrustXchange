import React, { useState } from 'react';
import { Card, Button, Typography, Box, Stack, Container } from '@mui/material';
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
        <Card 
          sx={{ 
            width: '400px',
            margin: 'auto',
            p: 4,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)'
          }}
        >

          {/* Pie Chart */}
          <Box sx={{ mb: 4 }}>
            <PieInfo 
              usd_amount={ammInfo?.usd_amount || 0} 
              xrp_amount={ammInfo?.xrp_amount || 0} 
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ mt: 1 }}
            >
              265M USD, 115M XRP
            </Typography>
          </Box>

          {/* Add Liquidity Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Add Liquidity
            </Typography>
            <Stack spacing={2}>
              <InputCard
                icon={<XrpIcon />}
                value={xrpValueInput}
                onChange={handleXrpValueChange}
                error={!!inputError}
                helperText={inputError}
                label="XRP Amount"
              />
              <InputCard
                icon={<UsdcIcon />}
                value={usdValueInput}
                onChange={handleUsdValueChange}
                error={!!inputError}
                helperText={inputError}
                label="USD Amount"
              />
            </Stack>

            <Button
              variant="contained"
              fullWidth
              onClick={handleAddLiquidity}
              disabled={connectionStatus !== 'connected' || isAdding || !!inputError}
              sx={{ 
                mt: 2,
                height: '44px',
                borderRadius: 2,
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0'
                }
              }}
            >
              {connectionStatus !== 'connected' ? 'Connect Wallet' : 
               isAdding ? 'Adding Liquidity...' : 'Add Liquidity'}
            </Button>

            {ammInfo && (
              <Box 
                sx={{ 
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(25, 118, 210, 0.02)',
                  border: '1px solid',
                  borderColor: 'rgba(25, 118, 210, 0.08)'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Pool Ratio: 1 USD = {(ammInfo.xrp_amount / ammInfo.usd_amount).toFixed(4)} XRP
                </Typography>
              </Box>
            )}
          </Box>

          {/* Position Section */}
          {connectedWallet && walletAMMnStatus && walletAMMnStatus.user_share > 0 && (
            <Box 
              sx={{ 
                mt: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'rgba(25, 118, 210, 0.02)',
                border: '1px solid',
                borderColor: 'rgba(25, 118, 210, 0.08)'
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {(walletAMMnStatus.user_share * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Pool Share
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  <Typography variant="body1">
                    {walletAMMnStatus.xrp_claimable.toFixed(6)} XRP
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {walletAMMnStatus.usd_claimable.toFixed(6)} USD
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  sx={{ 
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      bgcolor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw All'}
                </Button>
              </Stack>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
};

export default PoolPage;