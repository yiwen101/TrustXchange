import {
  Stack,
} from '@mui/material';
import React from 'react';

import 'chart.js/auto';
import PriceInfo from '../../Component/PriceInfo';
import PieInfo from '../../Component/PieInfo';

const PoolInfo: React.FC = () => {
  return (
      <Stack spacing={4} alignItems="center" justifyContent="center" maxHeight="100%">
          <PieInfo />
          <PriceInfo />
      </Stack>
  );
}

export default PoolInfo;