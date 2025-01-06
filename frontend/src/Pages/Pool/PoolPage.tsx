import React from 'react';
import { Card, Typography, Stack, Tabs, Tab } from '@mui/material';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity';
import PoolInfo from './PoolInfo';
import { usePool } from '../../hooks/usePool';

const PoolPage = () => {
    const [tabValue, setTabValue] = React.useState(0);

    const { 
        poolStats,
        userStats,
        isLoading 
    } = usePool();

    return (
        <Card style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <Typography variant="h5" gutterBottom>Liquidity Pool</Typography>
            
            <PoolInfo 
                poolStats={poolStats}
                userStats={userStats}
                isLoading={isLoading}
            />

            <Tabs 
                value={tabValue} 
                onChange={(_, newValue) => setTabValue(newValue)}
                style={{ marginTop: '20px' }}
            >
                <Tab label="Add Liquidity" />
                <Tab label="Remove Liquidity" />
            </Tabs>

            {tabValue === 0 ? (
                <AddLiquidity />
            ) : (
                <RemoveLiquidity />
            )}
        </Card>
    );
};

export default PoolPage;