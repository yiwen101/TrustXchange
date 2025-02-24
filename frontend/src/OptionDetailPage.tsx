import React, { useState, useRef } from 'react';
import { Container, Grid, Typography, Box, Paper, Divider, styled, IconButton, Menu, MenuItem, Button } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import moment from 'moment';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OptionPayoffChart } from './Pages/Future/OptionPayoffChart';
import { useOptionParams } from './hooks/useOptionParams';
import { useNavigate } from 'react-router-dom';
import { useXrpPriceValue } from './hooks/usePriceState';


const mockWarrantData = {
    id: 1,
    currentPrice: 12.50,
    priceChange: -0.35,
    volatility: 0.22,
    strike: 10.0,
    maturity: moment().add(15, 'days').unix(),
    optionType: 'Put',
    intrinsicValue: 2.50,
    contractSize: 100,
    timeValue: 1.0,
    quoteData: [
        { time: '9:00', price: 12.45 },
        { time: '10:00', price: 12.55 },
        { time: '11:00', price: 12.40 },
        { time: '12:00', price: 12.60 },
        { time: '13:00', price: 12.50 },
    ],
    bidAskData: [
        { type: 'Bid' as const, price: 12.40, quantity: 50, percentage: 51.81 },
        { type: 'Ask' as const, price: 12.60, quantity: 40, percentage: 48.19 },
    ],
    payoffData: [
        { underlyingPrice: 8, pnl: -1 },
        { underlyingPrice: 9, pnl: -1 },
        { underlyingPrice: 10, pnl: -1 },
        { underlyingPrice: 11, pnl: -1 },
        { underlyingPrice: 12, pnl: -1 },
        { underlyingPrice: 13, pnl: -1 },
    ],
  };

// First, let's define interfaces for our data structures
interface WarrantData {
  id: number;
  currentPrice: number;
  priceChange: number;
  volatility: number;
  strike: number;
  maturity: number;
  optionType: string;
  intrinsicValue: number;
  contractSize: number;
  timeValue: number;
  quoteData: QuoteDataPoint[];
  bidAskData: BidAskData[];
  payoffData: PayoffDataPoint[];
}

interface QuoteDataPoint {
  time: string;
  price: number;
}

interface BidAskData {
  type: 'Bid' | 'Ask';
  price: number;
  quantity: number;
  percentage: number;
}

interface PayoffDataPoint {
  underlyingPrice: number;
  pnl: number;
}

// Component Props interfaces
interface PriceSectionProps {
  currentPrice: number;
  priceChange: number;
  isStarred: boolean;
  handleStarToggle: () => void;
}

interface InformationSectionProps {
  warrant: WarrantData;
}

interface QuoteSectionProps {
  quoteData: QuoteDataPoint[];
}

interface BidAskSectionProps {
  bidAskData: BidAskData[];
}

interface PayoffSectionProps {
    currentPrice: number;
}

// Update the styled component to include custom props
interface BidAskBarProps {
  percentage: number;
  type: 'Bid' | 'Ask';
}

const PriceSection: React.FC<PriceSectionProps> = ({ currentPrice, priceChange, isStarred, handleStarToggle }) => {
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


const InformationSection: React.FC<InformationSectionProps> = ({ warrant }) => {
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

const QuoteSection: React.FC<QuoteSectionProps> = ({ quoteData }) => {
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

const BidAskBar = styled(Box)<BidAskBarProps>(({ theme, percentage, type }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '30px',
    backgroundColor: type === 'Bid' ? 'lightgreen' : 'lightcoral',
    width: `${percentage}%`,
    color: 'black',
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


const BidAskSection: React.FC<BidAskSectionProps> = ({ bidAskData }) => {
    const bid = bidAskData.find(item => item.type === 'Bid');
    const ask = bidAskData.find(item => item.type === 'Ask');

    if (!bid || !ask) return null;

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


const PayoffSection: React.FC<PayoffSectionProps> = ({ currentPrice }) => {
    const { optionType, strikePrice } = useOptionParams();
    
    return (
        <Box mb={2}>
            <Typography variant="h6" mb={1}>Payoff at Expiry</Typography>
            <OptionPayoffChart 
                strikePrice={strikePrice}
                currentPrice={currentPrice}
                optionPrice={1}
                optionType={optionType}
            />
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
const TradeSection: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const tradeButtonRef = useRef<HTMLButtonElement>(null);

    const handleTradeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(tradeButtonRef.current);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleMenuItemClick = (action: string) => {
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

const OptionDetailPage: React.FC = () => {
    const [isStarred, setIsStarred] = React.useState(false);
    const { optionType, strikePrice, expirationDate, isValid } = useOptionParams();
    const { xrpPrice, xrpPriceYesterday } = useXrpPriceValue();
    const navigate = useNavigate();

    if (!isValid || !xrpPrice) {
        navigate('/future');
        return null;
    }

    const handleStarToggle = () => {
        setIsStarred(!isStarred);
    };

    const handleBack = () => {
        navigate('/future');
    };

    const optionData = {
        ...mockWarrantData,
        currentPrice: xrpPrice,
        priceChange: xrpPriceYesterday ? xrpPrice - xrpPriceYesterday : 0,
        strike: strikePrice,
        optionType: optionType,
        maturity: moment(expirationDate).unix(),
        bidAskData: [
            { 
                type: 'Bid' as const, 
                price: xrpPrice * 0.98, 
                quantity: 50, 
                percentage: 51.81 
            },
            { 
                type: 'Ask' as const, 
                price: xrpPrice * 1.02, 
                quantity: 40, 
                percentage: 48.19 
            },
        ],
        quoteData: [
            { time: '9:00', price: xrpPrice * 0.99 },
            { time: '10:00', price: xrpPrice * 1.01 },
            { time: '11:00', price: xrpPrice * 0.98 },
            { time: '12:00', price: xrpPrice * 1.02 },
            { time: '13:00', price: xrpPrice },
        ],
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                <IconButton onClick={handleBack} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">
                    {optionType} Option Details (XRP: ${xrpPrice?.toFixed(2)})
                </Typography>
            </Box>

            <PriceSection
                currentPrice={optionData.currentPrice}
                priceChange={optionData.priceChange}
                isStarred={isStarred}
                handleStarToggle={handleStarToggle}
            />
            <InformationSection warrant={optionData} />
            <Divider style={{ margin: '20px 0'}}/>
            <QuoteSection quoteData={optionData.quoteData} />
            <Divider style={{ margin: '20px 0'}}/>
            <BidAskSection bidAskData={optionData.bidAskData} />
            <Divider style={{ margin: '20px 0'}}/>
            <PayoffSection currentPrice={xrpPrice} />
            <TradeSection />
        </Container>
    );
};

export default OptionDetailPage;