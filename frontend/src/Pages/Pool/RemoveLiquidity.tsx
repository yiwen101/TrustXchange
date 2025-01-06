import React, { useState } from 'react';
import { Stack, Button, Typography, Slider } from '@mui/material';
import { usePool } from '../../hooks/usePool';

const RemoveLiquidity = () => {
    const [percentage, setPercentage] = useState<number>(0);
    const { userStats, isLoading, removeLiquidity } = usePool();

    const handleRemove = async () => {
        if (percentage > 0) {
            await removeLiquidity(percentage);
        }
    };

    const marks = [
        { value: 0, label: '0%' },
        { value: 25, label: '25%' },
        { value: 50, label: '50%' },
        { value: 75, label: '75%' },
        { value: 100, label: '100%' }
    ];

    return (
        <Stack spacing={3} style={{ marginTop: '20px' }}>
            <Typography variant="h6">Remove Liquidity</Typography>
            
            {userStats && (
                <Stack spacing={2}>
                    <Typography>
                        You will receive approximately:
                    </Typography>
                    <Typography>
                        {((userStats.userXrp * percentage) / 100).toFixed(2)} XRP
                    </Typography>
                    <Typography>
                        {((userStats.userUsd * percentage) / 100).toFixed(2)} USD
                    </Typography>
                </Stack>
            )}

            <Slider
                value={percentage}
                onChange={(_, value) => setPercentage(value as number)}
                marks={marks}
                valueLabelDisplay="auto"
                valueLabelFormat={x => `${x}%`}
            />

            <Button
                variant="contained"
                onClick={handleRemove}
                disabled={isLoading || percentage === 0}
            >
                {isLoading ? 'Removing...' : 'Remove Liquidity'}
            </Button>
        </Stack>
    );
};

export default RemoveLiquidity; 