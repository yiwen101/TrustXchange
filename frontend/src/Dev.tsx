import React, { useState, useRef } from 'react';
import { Container, Grid, Typography, Box, Paper, Divider, styled, IconButton, Menu, MenuItem, Button } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import moment from 'moment';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShareIcon from '@mui/icons-material/Share';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';


const mockWarrantData = {
    id: 1,
    currentPrice: 12.50,
    priceChange: -0.35,
    volatility: 0.22,
    strike: 10.0,
    maturity: moment().add(15, 'days').unix(),
    optionType: 'Call',
    intrinsicValue: 2.50,
    contractSize: 100,
    timeValue: 3.00,
    quoteData: [
        { time: '9:00', price: 12.45 },
        { time: '10:00', price: 12.55 },
        { time: '11:00', price: 12.40 },
        { time: '12:00', price: 12.60 },
        { time: '13:00', price: 12.50 },
    ],
    bidAskData: [
        { type: 'Bid', price: 12.40, quantity: 50 , percentage: 51.81},
        { type: 'Ask', price: 12.60, quantity: 40, percentage: 48.19 },
    ],
    payoffData: [
        { underlyingPrice: 8, pnl: -2 },
        { underlyingPrice: 9, pnl: -1 },
        { underlyingPrice: 10, pnl: 0 },
        { underlyingPrice: 11, pnl: 1 },
        { underlyingPrice: 12, pnl: 2 },
        { underlyingPrice: 13, pnl: 3 },
    ],
  };

const PriceSection = ({ currentPrice, priceChange, isStarred, handleStarToggle }) => {
    return (
        <Box mb={2} display="flex" alignItems="center">
          <Box flexGrow={1}>
            <Typography variant="h4" gutterBottom>
                ${currentPrice.toFixed(2)}
            </Typography>
            <Typography variant="body1" color={priceChange >= 0 ? "green" : "red"}>
                {priceChange.toFixed(2)} ({priceChange >= 0 ? '▲' : '▼'})
            </Typography>
          </Box>
            <Box>
              <IconButton onClick={handleStarToggle} aria-label="star">
                  {isStarred ? <StarIcon color="primary" /> : <StarBorderIcon />}
              </IconButton>
            </Box>
        </Box>
    );
};


const InformationSection = ({ warrant }) => {
  const daysToExpiry = moment.unix(warrant.maturity).diff(moment(), 'days');
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
            <Typography variant="body2">
            Volatility: {warrant.volatility * 100}%
            </Typography>
        </Grid>
          <Grid item xs={6}>
              <Typography variant="body2">
                Strike: ${warrant.strike.toFixed(2)}
              </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              Maturity: {moment.unix(warrant.maturity).format('YYYY-MM-DD')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
              <Typography variant="body2">
                  Days to Expiry: {daysToExpiry}
              </Typography>
          </Grid>
          <Grid item xs={6}>
              <Typography variant="body2">
                 Option Type: {warrant.optionType}
              </Typography>
          </Grid>
        <Grid item xs={6}>
            <Typography variant="body2">
                Intrinsic Value: ${warrant.intrinsicValue.toFixed(2)}
            </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            Contract Size: {warrant.contractSize}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            Time Value: ${warrant.timeValue.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const QuoteSection = ({ quoteData }) => {
    return (
    <Box mb={2}>
        <Typography variant="h6" mb={1}>Quote</Typography>
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={quoteData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
      </Box>
    );
};


// Styled components
const BidAskContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const BidAskBar = styled(Box)(({ theme, percentage, type }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '30px',
    backgroundColor: type === 'Bid' ? 'lightgreen' : 'lightcoral',
    width: `${percentage}%`,
    color:  'black',
    textAlign: 'center',
    fontWeight: 'bold',
}));
const BidAskBarWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    textAlign: 'center',
}));

const BidAskInfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
    padding: theme.spacing(1),
}));

const BidAskItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
    justifyContent: 'center',
  flex: 1,
  color: theme.palette.text.secondary,
}));


const BidAskSection = ({ bidAskData }) => {
    const bid = bidAskData.find(item => item.type === 'Bid');
    const ask = bidAskData.find(item => item.type === 'Ask');


  return (
    <Box mb={2}>
      <Typography variant="h6" mb={1}>
        Bid and Ask
      </Typography>
      <BidAskContainer>
        <BidAskBarWrapper>
        <BidAskBar type="Bid" percentage={bid.percentage} >
              {bid.percentage}%
        </BidAskBar>
            <BidAskBar type="Ask" percentage={ask.percentage}  >
                {ask.percentage}%
        </BidAskBar>
        </BidAskBarWrapper>


          <BidAskInfoRow>
              <BidAskItem>
                  Bid
              </BidAskItem>
              <BidAskItem>
                  {bid.quantity}
              </BidAskItem>

              <BidAskItem>
                  {bid.price}  {ask.price}
              </BidAskItem>
              <BidAskItem>
                 {ask.quantity}
               </BidAskItem>

              <BidAskItem>
                  Ask
                </BidAskItem>

        </BidAskInfoRow>


      </BidAskContainer>
    </Box>
  );
};


const PayoffSection = ({ payoffData, strike }) => {
    const minPrice = Math.min(...payoffData.map(item => item.underlyingPrice));
    const maxPrice = Math.max(...payoffData.map(item => item.underlyingPrice));
    const minPnl = Math.min(...payoffData.map(item => item.pnl));
    const maxPnl = Math.max(...payoffData.map(item => item.pnl));


    return (
        <Box mb={2}>
            <Typography variant="h6" mb={1}>Payoff at Expiry</Typography>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={payoffData}>
                     <XAxis dataKey="underlyingPrice" domain={[minPrice, maxPrice]} />
                    <YAxis domain={[minPnl * 1.2, maxPnl * 1.2]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pnl" stroke="#ff7300" />
                    {/* Add a vertical line at the strike price */}
                    <ReferenceLine x={strike} stroke="gray"  />
                    <ReferenceLine y={0} stroke="black"  />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

// Styled component for the Trade Section to be at the bottom
const StickyTradeSection = styled(Box)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'rgb(236,236,238)',
    padding: theme.spacing(1),
    zIndex: 100, // Ensure it's above other content
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
       backgroundColor: theme.palette.primary.main,
  },
  '& .MuiMenuItem-root:hover': {
      backgroundColor: theme.palette.primary.light,
  },
  '& .MuiMenuItem-root':{
     color: 'white',
  }
}));
const TradeSection = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const tradeButtonRef = useRef(null);

    const handleTradeClick = (event) => {
        setAnchorEl(tradeButtonRef.current);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleMenuItemClick = (action) => {
        alert(`perform ${action} action`);
        handleClose();
    }
    return (
        <StickyTradeSection>
            <IconButton aria-label="share" color="primary">
                <ShareIcon/>
            </IconButton>
            <IconButton  aria-label="watchlist" color="primary">
                <PlaylistAddCheckIcon />
            </IconButton>
            <Button
                ref={tradeButtonRef}
                onClick={handleTradeClick}
                endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                variant="contained"
            >
                Trade
            </Button>
           <StyledMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                     vertical: 'bottom',
                     horizontal: 'center',
                 }}
             >
                <MenuItem onClick={() => handleMenuItemClick('buy/sell')}>Buy/Sell</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('short')}>Short</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('issue')}>Issue</MenuItem>
            </StyledMenu>
        </StickyTradeSection>
    );
};

const WarrantTradingPage = () => {
  const warrant = mockWarrantData;
    const [isStarred, setIsStarred] = React.useState(false);

    const handleStarToggle = () => {
        setIsStarred(!isStarred);
    };

  return (
      <Container>
          <PriceSection
              currentPrice={warrant.currentPrice}
              priceChange={warrant.priceChange}
              isStarred={isStarred}
              handleStarToggle={handleStarToggle}
          />
          <InformationSection warrant={warrant} />
          <Divider style={{ margin: '20px 0'}}/>
          <QuoteSection quoteData={warrant.quoteData} />
          <Divider style={{ margin: '20px 0'}}/>
          <BidAskSection bidAskData={warrant.bidAskData} />
          <Divider style={{ margin: '20px 0'}}/>
          <PayoffSection payoffData={warrant.payoffData} strike={warrant.strike} />
           <TradeSection  />
      </Container>
  );
};

export default WarrantTradingPage;