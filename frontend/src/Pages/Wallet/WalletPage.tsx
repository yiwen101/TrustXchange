import { useConnectedWalletValues } from '../../hooks/useConnectedWallet';
import { Box, Card, CardContent, Typography, Container } from '@mui/material';

function WalletPage() {
  const { balances } = useConnectedWalletValues();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          XRPL Wallet
        </Typography>
        <Card sx={{ minWidth: 275, mt: 2 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              User Account
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">USD Balance:</Typography>
              <Typography variant="h6">${balances.usd.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">XRP Balance:</Typography>
              <Typography variant="h6">{balances.xrp.toFixed(2)} XRP</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default WalletPage;