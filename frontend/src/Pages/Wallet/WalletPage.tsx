import { useConnectedWalletValues, useConnectedWalletActions } from '../../hooks/useConnectedWallet';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';

const WalletPage: React.FC = () => {
  const { balances, connectedWallet } = useConnectedWalletValues();
  const { connectOrCreateWallet, disconnectWallet, getTruncatedAddress } = useConnectedWalletActions();

  return (
    <Card sx={{ marginTop: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Wallet
        </Typography>
        
        {!connectedWallet && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Connect your wallet to view your balances.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={connectOrCreateWallet}
                sx={{ marginTop: 2 }}
              >
                Connect Wallet
              </Button>
            </Grid>
          </Grid>
        )}

        {connectedWallet && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Address: {getTruncatedAddress()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">USD Balance:</Typography>
              <Typography variant="h6">${balances.usd.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">XRP Balance:</Typography>
              <Typography variant="h6">{balances.xrp.toFixed(2)} XRP</Typography>
            </Grid>
            <Grid item xs={12} textAlign="right" marginTop={1}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

export default WalletPage;