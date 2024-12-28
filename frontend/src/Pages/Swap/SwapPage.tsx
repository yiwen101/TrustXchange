// SwapPage.tsx
import React, {  useState } from 'react';
import { Card, Button, IconButton, Typography, Stack} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import InputCard from './InputCard';
import xrp_api from '../../api/xrp';
import { useXrpPriceState } from '../../hooks/usePriceState';

const SwapPage = () => {
  const [usdValueInput, setUsdValueInput] = useState('');
  const [xrpValueInput, setXrpValueInput] = useState('');
  const [isXrpToUsd, setIsXrpToUsd] = useState(true);
  const [dp, setDp] = useState(2);
  const { xrpPrice, xrpPriceYesterday,ammInfo } = useXrpPriceState();
  
  const handleSwitch = () => {
    setIsXrpToUsd(!isXrpToUsd);
  };
  const handleXrpValueChange = (value: string) => {
    const max_tradable_usd = ammInfo!.usd_amount-10;
    const max_tradable_xrp = ammInfo!.xrp_amount-10;
    if (isXrpToUsd) {
      const usd_can_get = xrp_api.get_usd_can_get_with_xrp(parseFloat(value),ammInfo!);
      if (usd_can_get.toNumber() > max_tradable_usd) {
        setUsdValueInput(max_tradable_usd.toFixed(dp));
        const xrp_required = xrp_api.get_xrp_needed_for_usd(max_tradable_usd,ammInfo!);
        setXrpValueInput(xrp_required.toFixed(dp));
        return
      }
      setUsdValueInput(usd_can_get.toFixed(dp));
    } else {
      if (parseFloat(value) > max_tradable_xrp) {
        const usd_needed = xrp_api.get_usd_needed_for_xrp(max_tradable_xrp,ammInfo!);
        setXrpValueInput(max_tradable_xrp.toFixed(dp));
        setUsdValueInput(usd_needed.toFixed());
        return
      }
      const usd_can_get = xrp_api.get_usd_needed_for_xrp(parseFloat(value),ammInfo!);
      setUsdValueInput(usd_can_get.toFixed(dp));
    }
    setXrpValueInput(value);
  }
  const handleUsdValueChange = (value: string) => {
    const max_tradable_usd = ammInfo!.usd_amount-10;
    const max_tradable_xrp = ammInfo!.xrp_amount-10;
    if (isXrpToUsd) {
      if (parseFloat(value) > max_tradable_usd) {
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
  const current_price_2dp = xrpPrice ? xrpPrice.toFixed(2) : '0.00'
  const price_diff = xrpPrice && xrpPriceYesterday ? xrpPrice - xrpPriceYesterday : 0
  const price_diff_2dp = price_diff.toFixed(2)

  return (
    <Card style={{ padding: '20px', width: '250px', margin: 'auto' }}>
      <Typography variant="h5">Swap</Typography>
      {isXrpToUsd ? (
        <InputCard icon={<XrpIcon />} value={xrpValueInput} onChange={handleXrpValueChange} />
      ) : (
        <InputCard icon={<UsdcIcon />} value={usdValueInput} onChange={handleUsdValueChange} />
      )}
      <IconButton onClick={handleSwitch} style={{ marginTop: '2px' }}>
        <SwapVertIcon />
      </IconButton>
      {isXrpToUsd ? (
        <InputCard icon={<UsdcIcon />} value={usdValueInput} onChange={handleUsdValueChange} />
      ) : (
        <InputCard icon={<XrpIcon />} value={xrpValueInput} onChange={handleXrpValueChange}/>
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