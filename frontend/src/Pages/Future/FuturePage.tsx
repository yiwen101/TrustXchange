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

          {/* Call/Put Toggle */}
          <Box 
            sx={{ 
              display: 'flex', 
              mt: 3,
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                flex: 1,
                bgcolor: '#00C853',
                color: '#fff',
                py: 1.5,
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Call
            </Box>
            <Box 
              sx={{ 
                flex: 1,
                bgcolor: '#FF5252',
                color: '#fff',
                py: 1.5,
                textAlign: 'center',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Put
            </Box>
          </Box>

          {/* Options Table */}
          <Box sx={{ 
            bgcolor: 'rgba(30, 34, 66, 0.9)', 
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(9, 1fr)',
              gap: 1,
              p: 2,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '& > div': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                textAlign: 'center'
              }
            }}>
              <div>firstAsk</div>
              <div>firstBid</div>
              <div>volume</div>
              <div>price</div>
              <div>Strike</div>
              <div>price</div>
              <div>volume</div>
              <div>firstBid</div>
              <div>firstAsk</div>
            </Box>

            {/* Table Content */}
            <CallPutTable />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FuturePage;