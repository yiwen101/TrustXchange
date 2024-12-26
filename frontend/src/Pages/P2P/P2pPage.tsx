import * as React from 'react';
import P2pTable from './P2pTable';
import { Box, Tab, Tabs } from '@mui/material';
import P2pForm from './P2pForm';
// tabs: market, form, my orders

const P2pPage: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    };
  return (
    <Box width={'100%'}>
   ` <Box
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
          variant="fullWidth"
          centered
        >
          <Tab label="Full Table" />
          <Tab label="Smart Order" />
        </Tabs>
      </Box>
      {activeTab === 0 && (
        <Box p={2}>
          <P2pTable />
        </Box>
      )}
      {activeTab === 1 && (
        <Box p={2}>
          <P2pForm />
        </Box>
      )}
    </Box>
  );
}

export default P2pPage;