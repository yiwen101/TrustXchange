// SlidingDates.tsx

import React from 'react';
import SlidingDates from './SlidingDates';
import { Stack, Box, Container } from '@mui/material';
import CallPutTable from './CallPutTable';



const FuturePage: React.FC = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(13, 17, 48, 0.95) 0%, rgba(21, 25, 66, 0.95) 100%)',
        pt: 2,
        pb: 8
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ bgcolor: 'rgba(30, 34, 66, 0.6)', borderRadius: 2, p: 3 }}>
          {/* Date Slider */}
          <SlidingDates />
            <CallPutTable />
        </Box>
      </Container>
    </Box>
  );
};

export default FuturePage;