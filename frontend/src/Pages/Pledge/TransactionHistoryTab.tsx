import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';

interface Transaction {
  date: string;
  type: string;
  amount: number;
  collateral: number;
  status: string;
}

function TransactionHistoryTab() {
  const transactions: Transaction[] = [
    { date: '01/01/24', type: 'Borrowed', amount: 500, collateral: 400, status: 'Active' },
    { date: '12/20/23', type: 'Repaid', amount: 1000, collateral: 800, status: 'Closed' },
    //Add more transactions
  ];
    
  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Collateral</TableCell>
              <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>${transaction.amount}</TableCell>
                <TableCell>{transaction.collateral} XRP</TableCell>
                <TableCell>{transaction.status}</TableCell>
                  <TableCell>
                  <Button variant="outlined" size='small'>{transaction.status === 'Active' ? 'Repay' : 'View' }</Button>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
        <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="outlined">Download History</Button>
        </Box>
    </Box>
  );
}

export default TransactionHistoryTab;