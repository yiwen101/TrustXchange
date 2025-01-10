// SlidingDates.tsx

import React from 'react';
import { Box, Button, Stack } from '@mui/material';

const dates = [
  '17 Jan 2025',
  '24 Jan 2025',
  '31 Jan 2025',
  '07 Feb 2025',
  '14 Feb 2025',
  '21 Feb 2025',
  '28 Feb 2025',
  '07 Mar 2025',
  '14 Mar 2025',
  '21 Mar 2025',
  '28 Mar 2025',
  '04 Apr 2025',
  '11 Apr 2025',
  '18 Apr 2025',
  '25 Apr 2025',
  '02 May 2025',
  '09 May 2025',
  '16 May 2025',
  '23 May 2025',
  '30 May 2025',
  '06 Jun 2025',
];

const SlidingDates: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<string>('27 Dec 2024');

  return (
    <Box 
      sx={{ 
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        py: 2,
        backgroundColor: '#f6f6f6', // Light grey background
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#e6e6e6', // Light grey scrollbar track
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#bdbdbd', // Light grey scrollbar thumb
          borderRadius: '4px',
          '&:hover': {
            background: '#9e9e9e', // Darker grey on hover
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
              color: selectedDate === date ? '#000' : '#757575', // Darker grey for selected, light grey for others
              bgcolor: selectedDate === date ? '#f0f0f0' : 'transparent', // Light grey background for selected
              '&:hover': {
                bgcolor: selectedDate === date 
                  ? '#d5d5d5' 
                  : '#f0f0f0' // Slightly darker grey on hover
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