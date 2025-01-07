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
import { usePoolLendingValues } from '../../hooks/usePoolLendingState';

function TransactionHistoryTab() {
  const { userEvents} = usePoolLendingValues();

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
                <TableCell>View transaction </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userEvents && userEvents.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.eventName}</TableCell>
                <TableCell>${transaction.amount}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      href={transaction.transactionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View transaction 
                    </Button>
                </TableCell>
              </TableRow>
            ))}
             {!userEvents &&  <TableRow>
                  <TableCell colSpan={5} align="center">Log in to view transaction history</TableCell>
                </TableRow>}
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