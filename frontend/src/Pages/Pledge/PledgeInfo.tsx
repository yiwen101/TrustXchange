import {
  Stack,
} from '@mui/material';
import React from 'react';

import 'chart.js/auto';
import PriceInfo from '../../Component/PriceInfo';
import {PieInfo, PieInfoProps } from '../../Component/PieInfo';
import { useXrpPriceValue } from '../../hooks/usePriceState';

/*
import {
  Box,
  Typography,
  Stack,
} from '@mui/material';
import React from 'react';

import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
export interface PieInfoProps {
  usd_amount: number;
  xrp_amount: number;
}
export const PieInfo: React.FC<PieInfoProps | null> = (prop) => {
  // will be obtained from historical data of AMM in reality, but AMM on testnet is just created, so give a fake amount
  const annualInterestRate= '10%';
  // when info not ready, give an estimated 65/35 composition for visualization
  const get_composition = (prop: PieInfoProps | null) => {
    return {
      labels: ['USD', 'XRP'],
      datasets: [
        {
          data: (prop) ? [prop.usd_amount, prop.xrp_amount] : [65, 35],
          backgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    };
  }
  const getComposiitonStr = (prop: PieInfoProps | null) => {
    return prop ? `${numToSummaryString(prop.usd_amount)} USD, ${numToSummaryString(prop.xrp_amount)} XRP` : 'XXX USD, XXX XRP';
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
  const totalLiquidity = (prop: PieInfoProps | null) => {
    // assuming pool is balanced, so total liquidity is twice the amount of one asset
    return prop ? `$${numToSummaryString(prop.usd_amount*2)}` : '$XXX';
  }

  return (
      <Stack spacing={4} alignItems="center" justifyContent="center" maxHeight="100%">
        <Box display="flex" justifyContent="center" gap={4}>
          <Stack alignItems="center">
            <Box component="span" fontWeight="fontWeightBold" fontSize="3rem">{prop == null ? "XXX" : annualInterestRate}</Box>
            <Typography variant="subtitle1">Annual Interest Rate</Typography>
          </Stack>
          <Stack alignItems="center">
            <Box component="span" fontWeight="fontWeightBold" fontSize="3rem">{totalLiquidity(prop)}</Box>
            <Typography variant="subtitle1">Total Liquidity</Typography>
          </Stack>
        </Box>
        <Box width={200} height={200}>
          <Pie data={get_composition(prop)} options={{ maintainAspectRatio: false }} />
        </Box>
        <Box>
          <Typography variant="subtitle2">{getComposiitonStr(prop)}</Typography>
        </Box>
      </Stack>
  );
}

export default PieInfo;
*/
const PoolInfo: React.FC = () => {
  const {ammInfo} = useXrpPriceValue();
  return (
      <Stack spacing={4} alignItems="center" justifyContent="center" maxHeight="100%">
          <PieInfo usd_amount={ammInfo?.usd_amount || 0} xrp_amount={ammInfo?.xrp_amount || 0} />
          <PriceInfo />
      </Stack>
  );
}

export default PoolInfo;