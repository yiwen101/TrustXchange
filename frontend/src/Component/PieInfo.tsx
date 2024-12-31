import {
    Box,
    Typography,
    Stack,
  } from '@mui/material';
  import React from 'react';
  
  import { Pie } from 'react-chartjs-2';
  import 'chart.js/auto';
import { useXrpPriceValue } from '../hooks/usePriceState';
import { AMMInfo } from '../api/xrp/amm_transection';
  
  const PoolInfo: React.FC = () => {
    // will be obtained from historical data of AMM in reality, but AMM on testnet is just created, so give a fake amount
    const annualInterestRate= '10%';
    // when info not ready, give an estimated 65/35 composition for visualization
    const get_composition = (info: AMMInfo | null) => {
      return {
        labels: ['USD', 'XRP'],
        datasets: [
          {
            data: (info?.usd_amount && info?.xrp_amount) ? [info.usd_amount, info.xrp_amount] : [65, 35],
            backgroundColor: ['#36A2EB', '#FF6384'],
          },
        ],
      };
    }
    const getComposiitonStr = (info: AMMInfo | null) => {
      return info ? `${numToSummaryString(info.usd_amount)} USD, ${numToSummaryString(info.xrp_amount)} XRP` : 'XXX USD, XXX XRP';
    }
    // mocking amm with larger amount for better visualization
    const numToSummaryString = (num: number, mockOneMagHigher = true) => {
      if (mockOneMagHigher) {
        num *= 1000;
      }
      const billion = 1000000000;
      const million = 1000000;
      if (num > billion) {
        return `${(num / billion).toFixed(0)}B`;
      } else if (num > million) {
        return `${(num / million).toFixed(0)}M`;
      } else {
        return `${num}`;
      }
    }
    const totalLiquidity = (info: AMMInfo | null) => {
      // assuming pool is balanced, so total liquidity is twice the amount of one asset
      return info ? `$${numToSummaryString(info.usd_amount*2)}` : '$XXX';
    }

    const {ammInfo} = useXrpPriceValue();
  
    return (
        <Stack spacing={4} alignItems="center" justifyContent="center" maxHeight="100%">
          <Box display="flex" justifyContent="center" gap={4}>
            <Stack alignItems="center">
              <Box component="span" fontWeight="fontWeightBold" fontSize="3rem">{ammInfo == null ? "XXX" : annualInterestRate}</Box>
              <Typography variant="subtitle1">Annual Interest Rate</Typography>
            </Stack>
            <Stack alignItems="center">
              <Box component="span" fontWeight="fontWeightBold" fontSize="3rem">{totalLiquidity(ammInfo)}</Box>
              <Typography variant="subtitle1">Total Liquidity</Typography>
            </Stack>
          </Box>
          <Box width={200} height={200}>
            <Pie data={get_composition(ammInfo)} options={{ maintainAspectRatio: false }} />
          </Box>
          <Box>
            <Typography variant="subtitle2">{getComposiitonStr(ammInfo)}</Typography>
          </Box>
        </Stack>
    );
  }
  
  export default PoolInfo;