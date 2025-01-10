// SlidingDates.tsx

import React from 'react';
import { Box, Button, Stack } from '@mui/material';

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
  const [selectedDate, setSelectedDate] = React.useState<string>('27 Dec 2024');

  return (
    <Box 
      sx={{ 
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        py: 2,
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
        },
      }}
    >
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          px: 2,
          minWidth: 'min-content' 
        }}
      >
        {dates.map((date, index) => (
          <Button
            key={index}
            variant={selectedDate === date ? "contained" : "text"}
            onClick={() => setSelectedDate(date)}
            sx={{
              minWidth: 'auto',
              px: 2,
              py: 1,
              color: selectedDate === date ? '#fff' : 'rgba(255, 255, 255, 0.7)',
              bgcolor: selectedDate === date ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: selectedDate === date 
                  ? 'rgba(255, 255, 255, 0.15)' 
                  : 'rgba(255, 255, 255, 0.05)'
              },
              fontSize: '0.875rem',
              fontWeight: selectedDate === date ? 600 : 400,
            }}
          >
            {date}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default SlidingDates;