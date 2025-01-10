import React, { useState } from 'react';
import { Box, Tabs, Tab, Container, Card } from '@mui/material';
import LendingTab from './lendingTab/LendingTab';
import TransactionHistoryTab from './TransactionHistoryTab';
import LiquidityProvisionTab from './LiquidityProvisionTab';

function PledgePage() {
    const [activeTab, setActiveTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                background: `
                    linear-gradient(135deg, rgba(41, 98, 255, 0.03) 0%, rgba(0, 209, 255, 0.03) 100%),
                    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 20px 20px, 20px 20px',
                pt: 4,
                pb: 8
            }}
        >
            <Container maxWidth="md">
                <Card 
                    sx={{ 
                        borderRadius: 3,
                        bgcolor: '#ffffff',
                        border: '1px solid',
                        borderColor: 'rgba(41, 98, 255, 0.08)',
                        boxShadow: '0 4px 24px rgba(41, 98, 255, 0.05)'
                    }}
                >
                    <Box sx={{ 
                        borderBottom: 1, 
                        borderColor: 'rgba(41, 98, 255, 0.1)',
                        px: 3,
                        pt: 2
                    }}>
                        <Tabs 
                            value={activeTab} 
                            onChange={handleChange} 
                            aria-label="pledge tabs"
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    '&.Mui-selected': {
                                        color: '#2962FF',
                                        fontWeight: 600
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#2962FF',
                                    height: 2
                                }
                            }}
                        >
                            <Tab label="Lending" />
                            <Tab label="Transaction History" />
                            <Tab label="Liquidity Provision" />
                        </Tabs>
                    </Box>
                    
                    <Box sx={{ p: 3 }}>
                        {activeTab === 0 && <LendingTab />}
                        {activeTab === 1 && <TransactionHistoryTab />}
                        {activeTab === 2 && <LiquidityProvisionTab />}
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}

export default PledgePage;