// SwapPage.tsx
import React, { useEffect, useState } from 'react';
import { Card, Button, IconButton, Typography, Stack} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import InputCard from './InputCard';
import xrp_api from '../../api/xrp';
import { AMMInfo } from '../../api/xrp/amm_transection';
import { useXrpPriceState } from '../../hooks/usePriceState';

const SwapPage = () => {
  const [usdValueInput, setUsdValueInput] = useState('');
  const [xrpValueInput, setXrpValueInput] = useState('');
  const [isXrpToUsd, setIsXrpToUsd] = useState(true);
  const { xrpPrice, xrpPriceYesterday,ammInfo } = useXrpPriceState();
  
  const handleSwitch = () => {
    setIsXrpToUsd(!isXrpToUsd);
  };
  const current_price_2dp = xrpPrice ? xrpPrice.toFixed(2) : '0.00'
  const price_diff = xrpPrice && xrpPriceYesterday ? xrpPrice - xrpPriceYesterday : 0
  const price_diff_2dp = price_diff.toFixed(2)

  return (
    <Card style={{ padding: '20px', width: '250px', margin: 'auto' }}>
      <Typography variant="h5">Swap</Typography>
      {isXrpToUsd ? (
        <InputCard icon={<XrpIcon />} value={xrpValueInput} onChange={setXrpValueInput} />
      ) : (
        <InputCard icon={<UsdcIcon />} value={usdValueInput} onChange={setUsdValueInput} />
      )}
      <IconButton onClick={handleSwitch} style={{ marginTop: '2px' }}>
        <SwapVertIcon />
      </IconButton>
      {isXrpToUsd ? (
        <InputCard icon={<UsdcIcon />} value={usdValueInput} disabled />
      ) : (
        <InputCard icon={<XrpIcon />} value={xrpValueInput} disabled />
      )}
      <Button variant="contained" color="primary" style={{ marginTop: '20px', width: '100%' }}>
        Connect Wallet / Pay
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
    </Card>
  );
};

export default SwapPage;