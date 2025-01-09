// src/components/TransactionProgress.tsx

import React from 'react';
import { Box, Typography, Paper, Divider, Button, Tooltip, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import {USDC_issuer} from "../const";
import { useCurrentGMPCallState } from '../hooks/useCurrnetGMPCallState';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import InfoIcon from '@mui/icons-material/Info';

const ApproveTransaction = () => {
    const [isApproved, setIsApproved] = React.useState(false);
    const {xrplTransaction, evmTransaction} = useCurrentGMPCallState();
  return (
    <Paper elevation={3} sx={{ maxWidth: 600, padding: 3, margin: '20px auto' }}>
      <Typography variant="h6" gutterBottom>
        Approve the Transaction
      </Typography>

      <Box sx={{ marginBottom: 3, color: !isApproved ? 'grey.500' : 'inherit',
        opacity: !isApproved ? 0.6 : 1,}}>
        <Typography variant="subtitle1" gutterBottom>
          Sign and create GMP call
        </Typography>
        {xrplTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Signed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {xrplTransaction}
            </Typography>
          </Box>
        )}
        {isApproved&&!xrplTransaction && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Making GMP Call to Multisig Wallet on XRPL Testnet
                </Typography>
            </Box>
        )}
        {!isApproved && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HourglassBottomIcon />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Waiting for Approval to Sign and Create GMP Call
                </Typography>
            </Box>
        )}
        
        <Chip label="XRPL Devnet" color="secondary" size="small" sx={{ mt: 1 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>
            {USDC_issuer.address}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />

      <Box
    sx={{
        marginBottom: 3,
        padding: !xrplTransaction ? 2 : 0,
        borderRadius: 1,
        color: !xrplTransaction ? 'grey.500' : 'inherit',
        opacity: !xrplTransaction ? 0.6 : 1,
    }}
>
    <Typography variant="subtitle1" gutterBottom>
        Approval and Execution of Contract
    </Typography>
    {!xrplTransaction && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HourglassBottomIcon />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Waiting for GMP Call to Multisig Wallet on XRPL Testnet
            </Typography>
        </Box>
    )}
        {xrplTransaction && evmTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Signed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {evmTransaction}
            </Typography>
          </Box>
        )}
        {xrplTransaction && !evmTransaction && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Axaler is approving and executing the transaction
                </Typography>
            </Box>
        )}
        <Chip label="EVM Sidechain Devnet" color="primary" size="small" sx={{ mt: 1 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>
            0x31126a0BCf78cF10c8dC4381BF8A48a710df5978
        </Typography>
      </Box>

      

      <Divider sx={{ my: 2 }} />

      {/* Transaction Details */}
      <Box sx={{ marginBottom: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1">Send</Typography>
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2">~ 0 XRP</Typography>
          <Tooltip title="We may change this behaviour in production" placement="right">
            <InfoIcon fontSize="small" sx={{ ml: 0.5, cursor: 'pointer' }} />
          </Tooltip>
        </Box>
      </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">Estimated time needed</Typography>
          <Typography variant="body2">~ 30 seconds - 3 minutes</Typography>
        </Box>
      </Box>

      <Button variant="contained" color="primary" fullWidth onClick={() => setIsApproved(true)} disabled={isApproved}>
        Approve
      </Button>
    </Paper>
  );
};

export default ApproveTransaction;