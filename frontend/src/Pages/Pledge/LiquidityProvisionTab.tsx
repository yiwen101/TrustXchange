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
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles'; // Import styled
import { usePoolLendingActions } from '../../hooks/usePoolLendingState';
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

const StyledInfoText = styled(Typography)(({theme}) => ({
    fontWeight: 500,
     color: theme.palette.text.secondary,
}));

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(2),
    marginTop: theme.spacing(2)
}));

function LiquidityForm() {
  const {connectedWallet} = useConnectedWalletValues();
  const { handleContribute,
    handleWithdraw,
    handleClaimReward,
  } = usePoolLendingActions();
  const [contributeAmount, setContributeAmount] = useState('');
  // Mock contribution data (replace with actual data fetching)
  const [activeContribution, setActiveContribution] = useState({
       contributionAmount: 5000,
       tokenBalance: 10000,
       poolShare: 0.05
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('A name was submitted: ' + contributeAmount);
    const usdAmountFloat = parseFloat(contributeAmount);
    alert('A name was submitted: ' + usdAmountFloat);
    const usdAmountInt = Math.round(usdAmountFloat);
    alert('A name was submitted: ' + usdAmountInt);
    handleContribute(connectedWallet!,usdAmountInt, connectedWallet!.address);
    // Add your submission logic here
  };


  return (
    <Box component="form"  sx={{ p: 2 }} onSubmit={handleSubmit}>
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
        <Button variant="contained" color="primary" type="submit" sx={{marginTop: 2}}>
          Submit
        </Button>
      </Grid>

      {/* Divider */}
      <Divider sx={{marginTop: 4, marginBottom: 2}}/>

        {/* Manage Existing Contribution Section */}
        <Card sx={{marginTop: 3}} >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manage Liquidity Contribution
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                 <Typography variant="body2">Contributed Amount:</Typography>
                  <Typography variant="h6">$1000</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">Claimable Amount:</Typography>
                 <Typography variant="h6">$1100</Typography>
                </Grid>
               <Grid item xs={12} sm={4}>
                  <Typography variant="body2">Reward Value:</Typography>
                  <Typography variant="h6">$100</Typography>
                </Grid>
                 <Grid item xs={12} sm={12} textAlign={"right"} marginTop={1}>
                    <Button variant="outlined" color="primary"  sx={{ marginRight:1}}>
                       Withdraw
                    </Button>
                </Grid>
             </Grid>
           </CardContent>
          </Card>

    </Box>
  );
}

export default LiquidityForm;