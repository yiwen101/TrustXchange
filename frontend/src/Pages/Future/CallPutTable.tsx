// CallPutTable.tsx

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useRef } from 'react';

interface OptionData {
  type: 'Call' | 'Put';
  strikePrice: number;
  lastPrice: number;
  firstBid: number;
  firstAsk: number;
  volume: number;
}

interface OptionRow {
  strikePrice: number;
  call: OptionData;
  put: OptionData;
}

const currentPrice = 2.23;
const getStrikePrices = () => {
  let res = [];
  for (let i = 1.0; i <= currentPrice * 2; i += 0.1) {
    res.push(i);
  }
  return res;
}

const modelOptionPrice = (type: 'Call' | 'Put', strikePrice: number) => {
  const max_time_value = 0.3;
  const time_value = max_time_value - (max_time_value * Math.abs(currentPrice - strikePrice) / currentPrice);
  const intrinsic_value = type === 'Call' ? Math.max(currentPrice - strikePrice, 0) : Math.max(strikePrice - currentPrice, 0);
  const disruption = Math.random() * 0.1 - 0.05;
  return intrinsic_value + time_value + disruption;
}

const getOptionMocks = () => {
  const strikePrices = getStrikePrices();
  // stike to {call: , put: }
  const rowData: OptionRow[] = [];
  for (let i = 0; i < strikePrices.length; i++) {
    const callPrice = modelOptionPrice('Call', strikePrices[i]);
    const putPrice = modelOptionPrice('Put', strikePrices[i]);
    const callData: OptionData = {
      type: 'Call',
      strikePrice: strikePrices[i],
      lastPrice: callPrice,
      firstBid: callPrice - Math.random() * 0.05,
      firstAsk: callPrice + Math.random() * 0.05,
      volume: Math.floor(Math.random() * 1000),
    };
    const putData: OptionData = {
      type: 'Put',
      strikePrice: strikePrices[i],
      lastPrice: putPrice,
      firstBid: putPrice - Math.random() * 0.05,
      firstAsk: putPrice + Math.random() * 0.05,
      volume: 1000,
    };
    rowData.push({strikePrice: strikePrices[i], call: callData, put: putData});
  }
  return rowData
}

const itemsInSeq = ["price", "volume", "firstBid", "firstAsk"];



const CallPutTable: React.FC = () => {
  const options = getOptionMocks();
  const currentPriceRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    currentPriceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const upperOptions = options.filter((option) => option.strikePrice < currentPrice);
  const lowerOptions = options.filter((option) => option.strikePrice >= currentPrice);
  const CurrentPriceRow = () => (
    <TableRow >
      <TableCell ref={currentPriceRef} colSpan={9} align="center">
        Current Price: {currentPrice.toFixed(2)}
      </TableCell>
    </TableRow>
  );

  const renderRows = (opts: OptionRow[]) =>
    opts.map((option, index) => (
      <TableRow
        key={index}
      >
        <TableCell align="center">{option.call.firstAsk.toFixed(2)}</TableCell>
        <TableCell align="center">{option.call.firstBid.toFixed(2)}</TableCell>
        <TableCell align="center">{option.call.volume}</TableCell>
        <TableCell align="center">{option.call.lastPrice.toFixed(2)}</TableCell>
        <TableCell sx={{ backgroundColor: 'darkgrey' }} align="center">{option.strikePrice.toFixed(2)}</TableCell>
        <TableCell align="center">{option.put.lastPrice.toFixed(2)}</TableCell>
        <TableCell align="center">{option.put.volume}</TableCell>
        <TableCell align="center">{option.put.firstBid.toFixed(2)}</TableCell>
        <TableCell align="center">{option.put.firstAsk.toFixed(2)}</TableCell>
      </TableRow>
    ));
    const CallPutHeader: React.FC = () => {
      return (
        <Box display="flex" width="100%">
          <Box flex={1} bgcolor="green" color="white" textAlign="center" py={1}>
            Call
          </Box>
          <Box flex={1} bgcolor="red" color="white" textAlign="center" py={1}>
            Put
          </Box>
        </Box>
      );
    };
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <CallPutHeader />
      <TableContainer sx={{ maxHeight: '600px' }}>
        <Table aria-label="call put table" stickyHeader>
          <TableHead>
            <TableRow>
              {itemsInSeq.map((item, index) => (
                <TableCell align="center" key={index}>{item}</TableCell>
              ))}
              <TableCell align="center">Strike </TableCell>
              {itemsInSeq.reverse().map((item, index) => (
                <TableCell align="center" key={-index}>{item}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderRows(upperOptions)}
            <CurrentPriceRow />
            {renderRows(lowerOptions)}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
    );
  };

export default CallPutTable;