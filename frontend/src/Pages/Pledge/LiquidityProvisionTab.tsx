import React, { useState, useEffect } from 'react';
import {
    TextField,
    Typography,
    Grid,
    Box,
    Button,
    Paper,
    Card,
    CardContent,
    Divider,
    Alert,
    Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePoolLendingActions, usePoolLendingValues } from '../../hooks/usePoolLendingState';
import { useConnectedWalletValues } from '../../hooks/useConnectedWallet';

// Styled TextField for the contribution amount
const StyledContributeTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-input': {
        fontSize: '2rem',
        fontWeight: 700,
        padding: theme.spacing(2, 1),
        textAlign: "center"
    },
    '& .MuiInputLabel-root': {
        fontSize: '1.3rem',
        fontWeight: 600,
        color: theme.palette.primary.main,
    }
}));

function LiquidityForm() {
    const { connectedWallet } = useConnectedWalletValues();
    const { handleContribute, handleWithdraw, handleClaimReward, } = usePoolLendingActions();
    const { contributor } = usePoolLendingValues();
    const [contributeAmount, setContributeAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null)
        const usdAmountFloat = parseFloat(contributeAmount);
        if (isNaN(usdAmountFloat) || usdAmountFloat <= 0) {
            setError('Please enter a valid contribution amount.');
            return;
        }
         const usdAmountInt = Math.round(usdAmountFloat);

        try {
             if(connectedWallet){
                await handleContribute(connectedWallet!,usdAmountInt, connectedWallet.address);
                setSuccessMessage('Contribution successful!');
                 setContributeAmount('');
            }
          } catch (error:any) {
              setError(error?.message || 'Failed to contribute.');
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
                    bgcolor: 'rgba(30, 34, 66, 0.6)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
            >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#fff' }}>
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
                                bgcolor: 'rgba(30, 34, 66, 0.9)',
                                color: '#fff',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                }
                            },
                            '& .MuiOutlinedInput-input::placeholder': {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        sx={{
                            height: '56px',
                            px: 4,
                            bgcolor: '#2962FF',
                            '&:hover': {
                                bgcolor: '#1939B7'
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
                    bgcolor: 'rgba(30, 34, 66, 0.6)',
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
            >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#fff' }}>
                    Manage Liquidity Contribution
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }} gutterBottom>
                            Contributed Amount
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
                            ${contributor ? contributor.contributionBalance : '0'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }} gutterBottom>
                            Claimable Reward
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
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
                                bgcolor: 'rgba(30, 34, 66, 0.9)',
                                color: '#fff',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                }
                            },
                            '& .MuiOutlinedInput-input::placeholder': {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }}
                    />
                    <Button
                        variant="outlined"
                        sx={{
                            px: 3,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: '#fff',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Withdraw
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            px: 3,
                            bgcolor: '#2962FF',
                            '&:hover': {
                                bgcolor: '#1939B7'
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