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
        <Box component="form" sx={{ p: 2 }} onSubmit={handleSubmit}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

           {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}
            <Grid container spacing={3} justifyContent="center">
                {/* Contribution Amount */}
                <Grid item xs={12} md={8} lg={6} >
                    <StyledContributeTextField
                        label="Contribute Amount (USD)"
                        value={contributeAmount}
                         onChange={(e) => e.target.value ? setContributeAmount(e.target.value) : setContributeAmount('')}
                        fullWidth
                        type="number"
                        required
                    />
                </Grid>
                <Button variant="contained" color="primary" type="submit" sx={{ marginTop: 2 }}>
                    Submit
                </Button>
            </Grid>

            {/* Divider */}
            <Divider sx={{ marginTop: 4, marginBottom: 2 }} />

            {/* Manage Existing Contribution Section */}
            <Card sx={{ marginTop: 3 }} >
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Manage Liquidity Contribution
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2">Contributed Amount:</Typography>
                            <Typography variant="h6">
                                ${contributor ? contributor.contributionBalance : '0'}
                            </Typography>
                        </Grid>
                         <Grid item xs={12} sm={4}>
                             <Typography variant="body2">Claimable Reward:</Typography>
                            <Typography variant="h6">
                               ${contributor ? contributor.confirmedRewards : '0'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={12} textAlign={"right"} marginTop={1}>
                             <Box component="form"  onSubmit={handleWithdrawSubmit} display={"inline"}>
                              <TextField
                                    label="Withdraw Amount (USD)"
                                    value={withdrawAmount}
                                    onChange={(e) => e.target.value ? setWithdrawAmount(e.target.value) : setWithdrawAmount('')}
                                    type="number"
                                    required
                                    sx={{maxWidth: "150px", marginRight: "10px"}}
                                />
                                 <Button variant="outlined" color="primary" type="submit" sx={{ marginRight: 1 }}>
                                    Withdraw
                                </Button>
                             </Box>

                            <Button variant="contained" color="primary" onClick={handleClaimRewards}>
                                Claim Rewards
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

        </Box>
    );
}

export default LiquidityForm;