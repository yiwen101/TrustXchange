// src/components/TransactionProgress.tsx

import React from 'react';
import { Box, Typography, Paper, Divider, Button, Tooltip, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import {USDC_issuer} from "../const";

const ApproveTransaction = () => {
  return (
    <Paper elevation={3} sx={{ maxWidth: 600, padding: 3, margin: '20px auto' }}>
      <Typography variant="h6" gutterBottom>
        Approve the Transaction
      </Typography>

      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Sign and create GMP call
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Making GMP Call to Multisig Wallet on XRPL Testnet
          </Typography>
        </Box>
        <Chip label="XRPL Devnet" color="secondary" size="small" sx={{ mt: 1 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>
            {USDC_issuer.address}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Sign the create claim transaction
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Signed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            0x7de2c90da2be74f4eac5...5af84b1f6bc865c183df
          </Typography>
        </Box>
        <Chip label="EVM Sidechain Devnet" color="primary" size="small" sx={{ mt: 1 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          0x6Ac15576b50aa...9E31ee420922A
        </Typography>
      </Box>

      

      <Divider sx={{ my: 2 }} />

      {/* Transaction Details */}
      <Box sx={{ marginBottom: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1">Send</Typography>
          <Typography variant="body1">90 XRP</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1">Receive</Typography>
          <Typography variant="body1">90 XRP</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Fee and Time */}
      <Box sx={{ marginBottom: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tooltip title="Bridge transfer fees cover network costs." placement="top">
            <Typography variant="body2">Bridge Transfer Fee</Typography>
          </Tooltip>
          <Typography variant="body2">~ 5 XRP</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Estimated time of arrival</Typography>
          <Typography variant="body2">~ 30 seconds - 3 minutes</Typography>
        </Box>
      </Box>

      <Button variant="contained" color="primary" fullWidth>
        Approve
      </Button>
    </Paper>
  );
};

export default ApproveTransaction;