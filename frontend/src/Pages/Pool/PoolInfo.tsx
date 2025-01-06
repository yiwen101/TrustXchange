import React from 'react';
import { Card, Typography, Stack, CircularProgress } from '@mui/material';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';

interface PoolStats {
    totalXrp: number;
    totalUsd: number;
    apr: number;
    volume24h: number;
}

interface UserStats {
    userXrp: number;
    userUsd: number;
    sharePercentage: number;
    lpTokens: string;
}

interface PoolInfoProps {
    poolStats: PoolStats | null;
    userStats: UserStats | null;
    isLoading: boolean;
}

const PoolInfo = ({ poolStats, userStats, isLoading }: PoolInfoProps) => {
    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Card style={{ padding: '15px', marginTop: '10px' }}>
            <Stack spacing={2}>
                <Typography variant="h6">Pool Statistics</Typography>
                {poolStats && (
                    <>
                        <Stack direction="row" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <XrpIcon />
                                <Typography>XRP</Typography>
                            </Stack>
                            <Typography>{poolStats.totalXrp.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <UsdcIcon />
                                <Typography>USD</Typography>
                            </Stack>
                            <Typography>{poolStats.totalUsd.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>APR</Typography>
                            <Typography color="success.main">
                                {(poolStats.apr * 100).toFixed(2)}%
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>24h Volume</Typography>
                            <Typography>${poolStats.volume24h.toFixed(2)}</Typography>
                        </Stack>
                    </>
                )}

                {userStats && (
                    <>
                        <Typography variant="h6" style={{ marginTop: '20px' }}>
                            Your Position
                        </Typography>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>Share of Pool</Typography>
                            <Typography>
                                {(userStats.sharePercentage * 100).toFixed(2)}%
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>Your XRP</Typography>
                            <Typography>{userStats.userXrp.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>Your USD</Typography>
                            <Typography>{userStats.userUsd.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography>LP Tokens</Typography>
                            <Typography>{userStats.lpTokens}</Typography>
                        </Stack>
                    </>
                )}
            </Stack>
        </Card>
    );
};

export default PoolInfo; 