import { Box, Button, Card, CardContent, Grid2, Typography } from "@mui/material";

const PoolAction: React.FC = () => {
    const poolData = {
        totalLiquidity: '$123M',
        composition: {
          labels: ['USD', 'XRP'],
          datasets: [
            {
              data: [60, 40],
              backgroundColor: ['#36A2EB', '#FF6384'],
            },
          ],
        },
        exchangeRate: '1 USD = 3.5 XRP',
        annualInterestRate: '5%',
      };
    return (
        <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
        <CardContent>
          <Typography variant="body1">
            Current Exchange Rate: {poolData.exchangeRate}
          </Typography>
          <Box sx={{ height: '20px' }} />
          <Grid2 container spacing={4} justifyContent="center">
            <Grid2 >
                <Button variant="contained" color="primary">
                    Deposit USD
                </Button>
            </Grid2>
            <Grid2 >
                <Button variant="contained" color="primary">
                    Borrow USD
                </Button>
            </Grid2>
          </Grid2>
          </CardContent>
        </Card>
    );
}
export default PoolAction;