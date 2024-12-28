// SwapPage.tsx
import React, { useState } from 'react';
import { Card, Button, IconButton, Typography, Stack} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import InputCard from './InputCard';

const SwapPage = () => {
  const [usdValueInput, setUsdValueInput] = useState('');
  const [xrpValueInput, setXrpValueInput] = useState('');
  const [isXrpToUsd, setIsXrpToUsd] = useState(true);
  const [marketData] = useState({
    price: '1.25',
    change: '+2.5%',
    trend: [1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.25],
  });

  const handleSwitch = () => {
    setIsXrpToUsd(!isXrpToUsd);
  };

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
        <InputCard icon={<UsdcIcon />} value={usdValueInput} onChange={setUsdValueInput} />
      ) : (
        <InputCard icon={<XrpIcon />} value={xrpValueInput} onChange={setXrpValueInput} />
      )}
      <Button variant="contained" color="primary" style={{ marginTop: '20px', width: '100%' }}>
        Connect Wallet / Pay
      </Button>

      <Typography variant="h5" style={{ marginTop: '40px' }}>Market Condition</Typography>
      <Card style={{ padding: '10px', marginTop: '10px' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <XrpIcon />
            <Typography variant="h6">${marketData.price}</Typography>
            <Typography
              variant="body2"
              style={{ color: marketData.change.startsWith('+') ? 'green' : 'red' }}
            >
              {marketData.change} since yesterday
            </Typography>
          {/* Chart 
          <div style={{ width: '100px' }}>
            <Line
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    data: marketData.trend,
                    borderColor: 'blue',
                    fill: false,
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
          */}
        </Stack>
      </Card>
    </Card>
  );
};

export default SwapPage;