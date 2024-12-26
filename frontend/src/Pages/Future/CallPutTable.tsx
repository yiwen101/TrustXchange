// CallPutTable.tsx

import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { makeStyles } from '@mui/styles';

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

  const upperOptions = options.filter((option) => option.strikePrice < currentPrice);
  const lowerOptions = options.filter((option) => option.strikePrice >= currentPrice);

  const renderRows = (opts: OptionRow[]) =>
    opts.map((option, index) => (
      <TableRow
        key={index}
      >
        <TableCell>{option.call.firstAsk.toFixed(2)}</TableCell>
        <TableCell>{option.call.firstBid.toFixed(2)}</TableCell>
        <TableCell>{option.call.volume}</TableCell>
        <TableCell>{option.call.lastPrice.toFixed(2)}</TableCell>
        <TableCell>{option.strikePrice.toFixed(2)}</TableCell>
        <TableCell>{option.put.lastPrice.toFixed(2)}</TableCell>
        <TableCell>{option.put.firstBid.toFixed(2)}</TableCell>
        <TableCell>{option.put.firstAsk.toFixed(2)}</TableCell>
        <TableCell>{option.put.volume}</TableCell>
      </TableRow>
    ));
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table aria-label="call put table" stickyHeader>
          <TableHead>
            <TableRow>
              {itemsInSeq.map((item, index) => (
                <TableCell key={index}>{item}</TableCell>
              ))}
              <TableCell>Strike </TableCell>
              {itemsInSeq.reverse().map((item, index) => (
                <TableCell key={-index}>{item}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderRows(upperOptions)}
            {renderRows(lowerOptions)}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
    );
  };

export default CallPutTable;