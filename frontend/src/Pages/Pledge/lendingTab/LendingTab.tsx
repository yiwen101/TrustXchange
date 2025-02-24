import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
  Alert,
  Collapse,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles'; // Import styled
import BigNumber from 'bignumber.js';
import { useXrpPriceValue } from '../../../hooks/usePriceState';
import ExistingLoans from './ExistingLoans';
import { useConnectedWalletValues } from '../../../hooks/useConnectedWallet';
import { usePoolLendingActions } from '../../../hooks/usePoolLendingState';



const COLLATERAL_MULTIPLIER = 1.5; // Example multiplier
const LIQUIDATION_THRESHOLD = 1.1; // Example threshold
const INTEREST_RATE = 0.10;  // 12% as a decimal
const INTEREST_TERM = "Annual, compounding daily";
const dailyInterestBn = BigNumber(1.00026115787); // 0.026115787% as a decimal
function getPayableAfterDays(loanAmount:number, days:number) {
  return dailyInterestBn.exponentiatedBy(days).times(loanAmount).toNumber();
}


// Styled TextField for the borrow amount
const StyledBorrowTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '2rem',   // Larger font size
    fontWeight: 700,      // Bold text
    padding: theme.spacing(2, 1), // Increased padding
    textAlign: "center"
  },
  '& .MuiInputLabel-root': {
     fontSize: '1.3rem',
     fontWeight: 600,
     color: theme.palette.primary.main, // Primary color for label
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


const StyledSelectFormControl = styled(FormControl)(({ theme }) => ({
     marginTop: theme.spacing(1),  // Add some space from the top
     '& .MuiInputLabel-root': {
        fontWeight: 600,
        color: theme.palette.text.primary,
     },
    '& .MuiInputBase-root': {
      borderRadius: 4,
    },
  }));


function LoanForm() {
  const { xrpPrice} = useXrpPriceValue();
  const {connectedWallet} = useConnectedWalletValues();
  const {handleBorrow} = usePoolLendingActions();

  
  const [borrowAmount, setBorrowAmount] = useState('NA');
  const [repaymentTerm, setRepaymentTerm] = useState('week');
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [repaymentAmount, setRepaymentAmount] = useState(0);
  const [showWhatIf, setShowWhatIf] = useState(false);
  // Mock loan data (replace with actual data fetching)
  

  // Calculate collateral amount when borrowAmount changes
  useEffect(() => {
    if (!xrpPrice) {
      return;
    }
    const amount = parseFloat(borrowAmount) || 0;
    setCollateralAmount(amount * COLLATERAL_MULTIPLIER / xrpPrice);
  }, [borrowAmount]);

  // Calculate repayment amount when borrowAmount or repaymentTerm changes
    useEffect(() => {
    const amount = parseFloat(borrowAmount) || 0;
      let calculatedRepayment;
        switch (repaymentTerm) {
          case 'week':
            calculatedRepayment = getPayableAfterDays(amount, 7);
            break;
          case 'month':
               calculatedRepayment = getPayableAfterDays(amount, 30);
              break;
          case 'quarter':
               calculatedRepayment = getPayableAfterDays(amount, 90);
              break;
          case 'year':
            calculatedRepayment = getPayableAfterDays(amount, 365);
            break;
          default:
            calculatedRepayment = 0;
        }
      setRepaymentAmount(calculatedRepayment);
  }, [borrowAmount, repaymentTerm]);


  const handleSubmit = (event) => {
    event.preventDefault();
    handleBorrow(connectedWallet!, parseFloat(borrowAmount), Math.ceil(collateralAmount),connectedWallet!.classicAddress);
  };

    const handleExpandClick = () => {
       setShowWhatIf(!showWhatIf)
     }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Card >
      <CardContent>
      <Grid container spacing={3} justifyContent="center">
         {/* Borrow Amount */}
        <Grid item xs={12} md={8} lg={6} >
           <StyledBorrowTextField
              label="Borrow Amount (USD)"
              value={borrowAmount}
               onChange={(e) => e.target.value ? setBorrowAmount(e.target.value) : setBorrowAmount('NA')}
               fullWidth
               type="number"
               required
              />
         </Grid>
       </Grid>

        <StyledPaper>
          <Grid container spacing={2}>
                {/* Collateral Information */}
                <Grid item xs={12} sm={6} >
                    <StyledInfoText variant="body2">XRP Collateral Amount (XRP={xrpPrice?.toFixed(2)}USD):</StyledInfoText>
                    <Typography variant="h6"  >{collateralAmount.toFixed(2)}</Typography>
                  </Grid>

                 <Grid item xs={12} sm={6} >
                    <StyledInfoText variant="body2">Collatoral Value(150% of loan):</StyledInfoText>
                    <Typography variant="h6">{borrowAmount ? (parseFloat(borrowAmount) * COLLATERAL_MULTIPLIER).toFixed(2) : 0}</Typography>
                   </Grid>

                    {/* Interest Rate and term */}
                   <Grid item xs={12} sm={6} >
                      <StyledInfoText variant="body2">Interest Rate:</StyledInfoText>
                        <Typography variant="h6">{`${(INTEREST_RATE * 100).toFixed(0)}% ${INTEREST_TERM}`}</Typography>
                   </Grid>

                      {/* Repayment Schedule */}
                   <Grid item xs={12} sm={6} >
                       <StyledInfoText variant="body2">Repayment Schedule:</StyledInfoText>
                       <Typography variant="h6" >On Demand</Typography>
                   </Grid>
                </Grid>
        </StyledPaper>

        {/* Conditional Rendering for "Explore Amount Payable" */}
        {parseFloat(borrowAmount) > 0 && (
           <>
               <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                 <Typography variant="h6">Explore Amount Payable</Typography>
                <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={showWhatIf}
                    aria-label="show more"
                 >
                        <ExpandMoreIcon/>
                 </IconButton>
                </Box>

              <Collapse in={showWhatIf}>
                 <StyledPaper>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={6}>
                          <StyledSelectFormControl fullWidth>
                               <InputLabel id="repayment-term-label">
                                   If I pay back in:
                               </InputLabel>
                                 <Select
                                   labelId="repayment-term-label"
                                   value={repaymentTerm}
                                  onChange={(e) => setRepaymentTerm(e.target.value)}
                                 >
                                   <MenuItem value="week">One Week</MenuItem>
                                    <MenuItem value="month">One Month</MenuItem>
                                   <MenuItem value="quarter">One Quarter</MenuItem>
                                  <MenuItem value="year">One Year</MenuItem>
                                 </Select>
                         </StyledSelectFormControl>
                     </Grid>
                    <Grid item xs={6} sm={6} >
                        <StyledInfoText variant="body2">I will need to pay back:</StyledInfoText>
                        <Typography variant="h6">{repaymentAmount.toFixed(2)}</Typography>
                        </Grid>
                   </Grid>
                </StyledPaper>
              </Collapse>
         </>
        )}

         {/* Auto Liquidation Alert */}
         <Alert severity="warning" sx={{ marginTop:2, display: "flex", justifyContent: "center" }}>
              This loan is subject to auto-liquidation if the collateral value falls below {(LIQUIDATION_THRESHOLD * 100).toFixed(0)}% of the loan amount.
         </Alert>

        {/* Submit Button */}
        <Box textAlign="center" mt={3}>
          <Button variant="contained" type="submit" disabled={connectedWallet === null}>
            Submit
          </Button>
         </Box>
         </CardContent>
          </Card>

           {/* Manage Existing Loan Card */}
           <ExistingLoans />
    </Box>
  );
}

export default LoanForm;