import {
  Typography,
  Grid,
  Button,
  Card,
  CardContent
} from '@mui/material';
import React from 'react';
import { usePoolLendingValues } from '../../../hooks/usePoolLendingState';
import { useConnectedWalletValues } from '../../../hooks/useConnectedWallet';



const ExistingLoans : React.FC = () => {
    const {borrower} = usePoolLendingValues();
    const {connectedWallet} = useConnectedWalletValues();
  return (
           <Card sx={{marginTop: 3}} >
            <CardContent>
              { !connectedWallet && (
                  <Typography variant="body2">
                    Connect your wallet to view your active loans.
                  </Typography>)}
              {connectedWallet && !borrower && (
                <Typography variant="body2">
                  You do not have any active loans.
                </Typography>
              )}
              {connectedWallet &&  borrower &&(<Typography variant="h6" gutterBottom>
                Manage Active Loan
              </Typography>
              )}
              {connectedWallet &&  borrower && ( 
                <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                 <Typography variant="body2">Loan Amount:</Typography>
                  <Typography variant="h6">${borrower.borrowAmountUsd}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                 <Typography variant="body2">Paid Amount:</Typography>
                  <Typography variant="h6">${borrower.repaidUsd}</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Payable Amount:</Typography>
                 <Typography variant="h6">${borrower.amountPayableUsd}</Typography>
                </Grid>
               <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Collateral Amount:</Typography>
                  <Typography variant="h6">${borrower.collateralAmountXrp}</Typography>
                </Grid>
                 <Grid item xs={12} sm={12} textAlign={"right"} marginTop={1}>
                    <Button variant="outlined" color="primary"  sx={{ marginRight:1}}>
                       Repay
                    </Button>
                  <Button variant="outlined" color="primary">
                       Add Collateral
                    </Button>
                </Grid>
             </Grid>)}
             
           </CardContent>
          </Card>
  );
}

export default ExistingLoans;