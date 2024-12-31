import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import LendingTab from './LendingTab';
import TransactionHistoryTab from './TransactionHistoryTab';
import LiquidityProvisionTab from './LiquidityProvisionTab';

function PledgePage() {
    const [activeTab, setActiveTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    };

    return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleChange} aria-label="pledge tabs">
                    <Tab label="Lending" />
                    <Tab label="Transaction History" />
                    <Tab label="Liquidity Provision" />
                </Tabs>
            </Box>
            {activeTab === 0 && <LendingTab />}
            {activeTab === 1 && <TransactionHistoryTab />}
            {activeTab === 2 && <LiquidityProvisionTab />}
        </Box>
    );
}

export default PledgePage;