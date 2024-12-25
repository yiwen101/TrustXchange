import React from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    Grid2,
    Card,
    CardContent,
} from '@mui/material';
import PoolAction from './PollAction';

const UserInfo: React.FC = () => {
    const userDetails = {
        deposited: '$1000',
        claimable: '$1125',
        borrowed: '$200',
        repayable: '$250',
    };

    return (
        <Stack spacing={4}>
            <Typography variant="h6">Action</Typography>
            <Grid2 container spacing={4}>
                <Grid2 >
                    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
                        <CardContent>
                            <Typography>Deposited: {userDetails.deposited}</Typography>
                            <Typography>Claimable: {userDetails.claimable}</Typography>
                            <Box sx={{ height: '20px' }} />
                            <Button variant="contained" color="primary">
                                Withdraw
                            </Button>
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2>
                    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
                        <CardContent>
                            <Typography>Borrowed: {userDetails.borrowed}</Typography>
                            <Typography>Repayable: {userDetails.repayable}</Typography>
                            <Box sx={{ height: '20px' }} />
                            <Button variant="contained" color="primary">
                                Pay Back
                            </Button>
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
            <PoolAction />
        </Stack>
    );
};

export default UserInfo;