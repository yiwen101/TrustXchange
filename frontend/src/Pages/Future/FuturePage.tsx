// SlidingDates.tsx

import React from 'react';
import SlidingDates from './SlidingDates';
import { Stack } from '@mui/material';
import CallPutTable from './CallPutTable';



const FuturePage: React.FC = () => {
  return (
    <Stack>
    <SlidingDates/>
    <CallPutTable/>
    </Stack>
  );
};

export default FuturePage;