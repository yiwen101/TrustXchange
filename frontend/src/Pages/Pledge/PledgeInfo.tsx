import {
  Box,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import React from 'react';

import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const PoolInfo: React.FC = () => {
  const poolData = {
    totalLiquidity: '$123M',
    composition: {
      labels: ['USD', 'XRP'],
      datasets: [
        {
          data: [60, 40],
          backgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    },
    exchangeRate: '1 USD = 3.5 XRP',
    annualInterestRate: '5%',
  };

  return (
      <Stack spacing={4} alignItems="center" justifyContent="center" maxHeight="100%">
        <Box display="flex" justifyContent="center" gap={4}>
          <Stack alignItems="center">
            <Box component="span" fontWeight="fontWeightBold" fontSize="3rem">{poolData.annualInterestRate}</Box>
            <Typography variant="subtitle1">Annual Interest Rate</Typography>
          </Stack>
          <Stack alignItems="center">
            <Box component="span" fontWeight="fontWeightBold" fontSize="3rem">{poolData.totalLiquidity}</Box>
            <Typography variant="subtitle1">Total Liquidity</Typography>
          </Stack>
        </Box>
        <Box width={200} height={200}>
          <Pie data={poolData.composition} options={{ maintainAspectRatio: false }} />
        </Box>
        <Box>
          <Typography variant="subtitle2">Pool Composition: 60% USD, 40% XRP</Typography>
        </Box>
        <Box>
          <Alert severity="info">
            Current Exchange Rate: {poolData.exchangeRate}
          </Alert>
        </Box>
      </Stack>
  );
}

export default PoolInfo;