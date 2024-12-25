// src/PoolPage.tsx
import React from 'react';
import {
  Box,
  Grid2,
  Paper,
  Stack,
} from '@mui/material';
import PoolInfo from './PoolInfo';
import PoolActions from './PoolActions';

const PoolPage: React.FC = () => {


  return (
    <Stack height={"calc(100vh-65px)"} display={'flex'} flexDirection={'column'}>
      <Box p={3}>
        <Grid2 container spacing={4} justifyContent="center">
            <Grid2 >
              <Paper elevation={3} sx={{ p: 3 }}>
                <PoolInfo />
              </Paper>
            </Grid2>
            <Grid2 >
              <Paper elevation={3} sx={{ p: 3 }}>
                <PoolActions />
              </Paper>
            </Grid2>
        </Grid2>
      </Box>
      </Stack>
  );
};

export default PoolPage;