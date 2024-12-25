// src/PoolPage.tsx
import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import PoolInfo from './PollInfo';
import UserInfo from './userInfo';

const PoolPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };



  

  return (
    <Box>
        <Box sx={{ height: '64px' }} />
    <Box p={3} sx={{ position: 'relative', height: '100vh', overflow: 'auto' }}>
      {/* Fixed Tabs */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.paper',
          zIndex: 10,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Pool Information" />
          <Tab label="User Details" />
        </Tabs>
      </Box>

      {/* Content Paper */}
      <Paper elevation={3} sx={{ mt: 2, p: 3 }}>
        {activeTab === 0 && <PoolInfo />}
        {activeTab === 1 && <UserInfo />}
      </Paper>
    </Box>
    </Box>
  );
};

export default PoolPage;