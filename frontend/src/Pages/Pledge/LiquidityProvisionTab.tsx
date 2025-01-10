import React, { useState, useEffect } from 'react';
import {
    TextField,
    Typography,
    Grid,
    Box,
    Button,
    Stack,
    useTheme,
} from '@mui/material';
import { usePoolLendingActions, usePoolLendingValues } from '../../hooks/usePoolLendingState';
import { useConnectedWalletValues } from '../../hooks/useConnectedWallet';

function LiquidityForm() {
    const theme = useTheme();
    const { connectedWallet } = useConnectedWalletValues();
    const { handleContribute, handleWithdraw, handleClaimReward } = usePoolLendingActions();
    const { contributor } = usePoolLendingValues();
    const [contributeAmount, setContributeAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    /*
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const usdAmountFloat = parseFloat(contributeAmount);
        if (isNaN(usdAmountFloat) || usdAmountFloat <= 0) {
            return;
        }
         const usdAmountInt = Math.round(usdAmountFloat);


             if(connectedWallet){
                await handleContribute(connectedWallet!,usdAmountInt, connectedWallet.address)
                 setContributeAmount('');
            }
          

    };

    const handleWithdrawSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
         setError(null);
        setSuccessMessage(null)
        const withdrawAmountFloat = parseFloat(withdrawAmount);

        if (isNaN(withdrawAmountFloat) || withdrawAmountFloat <= 0) {
          setError('Please enter a valid withdraw amount.');
            return;
        }
        try {
            if(connectedWallet){
               await handleWithdraw(connectedWallet!,withdrawAmountFloat, connectedWallet.address);
               setSuccessMessage('Withdrawal successful!');
            }
            setWithdrawAmount('');

         } catch (error:any) {
               setError(error?.message || 'Failed to withdraw.');
        }

    }

    const handleClaimRewards = async () => {
        setError(null);
        setSuccessMessage(null)
        try {
            if(connectedWallet){
                await handleClaimReward(connectedWallet!,connectedWallet.address);
                 setSuccessMessage('Rewards claimed successfully!');
            }
         } catch (error:any) {
            setError(error?.message || 'Failed to claim rewards.');
        }
    };
    */

    useEffect(() => {
      if(connectedWallet){
        //  fetchContributorData(connectedWallet.address);
      }
    }, [connectedWallet]);

    return (
        <Box>
            {/* Contribute Section */}
            <Box 
                sx={{ 
                    mb: 4,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: theme.palette.divider
                }}
            >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
                    Contribute Amount (USD)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <TextField
                        fullWidth
                        placeholder="Enter amount"
                        variant="outlined"
                        size="medium"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: theme.palette.background.default,
                                color: theme.palette.text.primary,
                                '& fieldset': {
                                    borderColor: theme.palette.divider,
                                },
                                '&:hover fieldset': {
                                    borderColor: theme.palette.text.secondary,
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main,
                                }
                            },
                            '& .MuiOutlinedInput-input::placeholder': {
                                color: theme.palette.text.disabled
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        sx={{
                            height: '56px',
                            px: 4,
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark
                            }
                        }}
                    >
                        Submit
                    </Button>
                </Stack>
            </Box>

            {/* Manage Liquidity Section */}
            <Box 
                sx={{ 
                    p: 3,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: theme.palette.divider
                }}
            >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
                    Manage Liquidity Contribution
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} gutterBottom>
                            Contributed Amount
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            ${contributor ? contributor.contributionBalance : '0'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} gutterBottom>
                            Claimable Reward
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            ${contributor ? contributor.confirmedRewards : '0'}
                        </Typography>
                    </Grid>
                </Grid>

                <Stack direction="row" spacing={2}>
                    <TextField
                        placeholder="Withdraw Amount"
                        variant="outlined"
                        size="medium"
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: theme.palette.background.default,
                                color: theme.palette.text.primary,
                                '& fieldset': {
                                    borderColor: theme.palette.divider,
                                },
                                '&:hover fieldset': {
                                    borderColor: theme.palette.text.secondary,
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main,
                                }
                            },
                            '& .MuiOutlinedInput-input::placeholder': {
                                color: theme.palette.text.disabled
                            }
                        }}
                    />
                    <Button
                        variant="outlined"
                        sx={{
                            px: 3,
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.primary,
                            '&:hover': {
                                borderColor: theme.palette.text.secondary,
                                bgcolor: theme.palette.action.hover
                            }
                        }}
                    >
                        Withdraw
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            px: 3,
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark
                            }
                        }}
                    >
                        Claim Rewards
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default LiquidityForm;