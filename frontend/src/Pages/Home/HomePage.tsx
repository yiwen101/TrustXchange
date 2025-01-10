import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Container,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <CompareArrowsIcon fontSize="large" />,
      title: "Cross-Chain Trading",
      description: "Trade options across multiple blockchains seamlessly through Axelar's GMP, enabling true DeFi interoperability."
    },
    {
      icon: <AccountBalanceIcon fontSize="large" />,
      title: "P2P Settlement",
      description: "Direct peer-to-peer option trading and settlement without intermediaries, powered by smart contracts."
    },
    {
      icon: <LockIcon fontSize="large" />,
      title: "Stake & Earn",
      description: "Participate in network security and earn rewards by staking your tokens in our protocol."
    },
    {
      icon: <SwapHorizIcon fontSize="large" />,
      title: "Options Trading",
      description: "Advanced cryptocurrency options trading with professional tools and deep liquidity."
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: "Secure Infrastructure",
      description: "Built on Axelar's secure cross-chain communication protocol with audited smart contracts."
    },
    {
      icon: <SpeedIcon fontSize="large" />,
      title: "Fast Settlement",
      description: "Quick and efficient cross-chain settlements through Axelar's General Message Passing."
    }
  ];

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
          
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            TrustXchange
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            First Cross-Chain DeFi Options Trading Platform with P2P Settlement
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={() => navigate('/future')}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Options Trading
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/p2p')}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'grey.300',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                P2P Settlement
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined"
                size="large"
                onClick={() => navigate('/pledge')}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'grey.300',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Pledge
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;