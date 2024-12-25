import {
    Box,
    Typography,
    Stack,
  } from '@mui/material';

import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const PoolInfo: React.FC = () => {
    const poolData = {
        totalLiquidity: '$1,234,567',
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
        interest: 'Pool deposit/borrow interest',
      };
    return (
    <Stack spacing={4}>
            <Typography variant="h6">
              Total Liquidity: {poolData.totalLiquidity}
            </Typography>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', md: 'row' }}
              gap={4}
            >
              <Box width={{ xs: '100%', md: '50%' }}>
                <Pie data={poolData.composition} />
              </Box>
              <Box>
                <Typography variant="subtitle1">Pool Composition:</Typography>
                <Typography variant="body1">- 60% USD</Typography>
                <Typography variant="body1">- 40% XRP</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body1">
                Current Exchange Rate: {poolData.exchangeRate}
              </Typography>
              <Typography variant="body1">{poolData.interest}</Typography>
            </Box>
          </Stack>
    );
}

export default PoolInfo;