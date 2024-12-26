// SlidingDates.tsx

import React from 'react';
import { Box, Button } from '@mui/material';

const dates = [
  '27 Dec 2024',
  '03 Jan 2025',
  '10 Jan 2025',
  '17 Jan 2025',
  '24 Jan 2025',
  '31 Jan 2025',
  '07 Feb 2025',
  '14 Feb 2025',
  '21 Feb 2025',
  '28 Feb 2025',
  '27 Dec 2024',
  '03 Jan 2025',
  '10 Jan 2025',
  '17 Jan 2025',
  '24 Jan 2025',
  '31 Jan 2025',
  '07 Feb 2025',
  '14 Feb 2025',
  '21 Feb 2025',
  '28 Feb 2025',
];

const SlidingDates: React.FC = () => {
  return (
    <Box sx={{ overflow: 'auto', whiteSpace: 'nowrap', padding: '10px', backgroundColor: '#f5f5f5' }}>
      {dates.map((date, index) => (
        <Button
          key={index}
          variant="text"
            sx={{ margin: '0 5px', color: '#000' }}
        >
          {date}
        </Button>
      ))}
    </Box>
  );
};

export default SlidingDates;