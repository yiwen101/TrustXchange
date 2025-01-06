import {
  Typography,
  Grid,
  Button,
  Card,
  CardContent
} from '@mui/material';
import React, { useState } from 'react';



const ExistingLoans : React.FC = () => {
    const [activeLoan, setActiveLoan] = useState({
        loanAmount: 1000,
        payableAmount: 1100,
        collateralValue: 1500
    })
  return (
           <Card sx={{marginTop: 3}} >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manage Active Loan
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                 <Typography variant="body2">Loan Amount:</Typography>
                  <Typography variant="h6">${activeLoan.loanAmount}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">Payable Amount:</Typography>
                 <Typography variant="h6">${activeLoan.payableAmount}</Typography>
                </Grid>
               <Grid item xs={12} sm={4}>
                  <Typography variant="body2">Collateral Value:</Typography>
                  <Typography variant="h6">${activeLoan.collateralValue}</Typography>
                </Grid>
                 <Grid item xs={12} sm={12} textAlign={"right"} marginTop={1}>
                    <Button variant="outlined" color="primary"  sx={{ marginRight:1}}>
                       Repay
                    </Button>
                  <Button variant="outlined" color="primary">
                       Add Collateral
                    </Button>
                </Grid>
             </Grid>
           </CardContent>
          </Card>
  );
}

export default ExistingLoans;