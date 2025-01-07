import React, { useState, useMemo } from 'react';
import { Stack, Button, Typography, Slider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { usePool } from '../../hooks/usePool';

const RemoveLiquidity = () => {
    const [percentage, setPercentage] = useState<number>(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { userStats, isLoading, removeLiquidity } = usePool();

    // 计算最小接收金额
    const minReceiveAmounts = useMemo(() => {
        if (!userStats || percentage === 0) return { xrp: '0', usd: '0' };
        const MIN_RECEIVE = 0.99; // 99%
        return {
            xrp: ((userStats.userXrp * percentage * MIN_RECEIVE) / 100).toFixed(2),
            usd: ((userStats.userUsd * percentage * MIN_RECEIVE) / 100).toFixed(2)
        };
    }, [userStats, percentage]);

    const handleRemoveClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmRemove = async () => {
        if (percentage > 0 && userStats) {
            const lpTokensToRemove = (Number(userStats.lpTokens) * percentage) / 100;
            await removeLiquidity(lpTokensToRemove);
        }
        setShowConfirmation(false);
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
                onClick={handleRemoveClick}
                disabled={isLoading || percentage === 0}
            >
                {isLoading ? 'Removing...' : 'Remove Liquidity'}
            </Button>

            <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
                <DialogTitle>Confirm Remove Liquidity</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Typography>You will receive at least:</Typography>
                        <Typography>{minReceiveAmounts.xrp} XRP</Typography>
                        <Typography>{minReceiveAmounts.usd} USD</Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
                    <Button onClick={handleConfirmRemove} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default RemoveLiquidity; 