import {
    Box,
    Typography,
    Button,
    Stack,
} from '@mui/material';

const UserInfo = () => {
    const userDetails = {
        withdrawableDeposit: '$500',
        borrowedAmount: '$200',
      };
    return (
        <Stack spacing={4}>
          <Typography variant="h6">User Details</Typography>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            gap={4}
          >
            <Box>
              <Typography variant="body1">
                Withdrawable Deposit: {userDetails.withdrawableDeposit}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1">
                Borrowed Amount: {userDetails.borrowedAmount}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button variant="contained" color="primary">
              Lend
            </Button>
            <Button variant="contained" color="secondary">
              Deposit
            </Button>
            <Button variant="contained" color="warning">
              Withdraw
            </Button>
            <Button variant="contained" color="success">
              Payback Loan
            </Button>
          </Box>
        </Stack>
    )};

export default UserInfo;