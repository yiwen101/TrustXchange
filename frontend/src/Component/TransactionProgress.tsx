// src/components/ApproveTransaction.tsx

import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Button, Tooltip, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import InfoIcon from '@mui/icons-material/Info';
import { USDC_issuer } from "../const";
import { useCurrentGMPCallState } from '../hooks/useCurrnetGMPCallState';

interface ApproveTransactionProps {
  onApprove: () => Promise<void>;
  onClose: () => void;
}

const ApproveTransaction: React.FC<ApproveTransactionProps> = ({ onApprove, onClose }) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { xrplTransaction, evmTransaction } = useCurrentGMPCallState();

  const handleButtonClicked = async () => {
    if (isFinished) {
      onClose();
      return;
    }

    try {
      setIsApproved(true);
      await onApprove();
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsFinished(true);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, padding: 3, margin: '20px auto' }}>
      <Typography variant="h6" gutterBottom>
        Approve the Transaction
      </Typography>

      {/* Sign and Create GMP Call Section */}
      <Box
        sx={{
          marginBottom: 3,
          color: !xrplTransaction ? 'grey.500' : 'inherit',
          opacity: !xrplTransaction ? 0.6 : 1,
          padding: 2,
          borderRadius: 1,
        }}
      >
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
        {!xrplTransaction && (
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

      {/* Approval and Execution of Contract Section */}
      <Box
        sx={{
          marginBottom: 3,
          padding: 2,
          borderRadius: 1,
          color: !xrplTransaction ? 'grey.500' : 'inherit',
          opacity: !xrplTransaction ? 0.6 : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
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

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleButtonClicked}
        disabled={isApproved && !isFinished}
      >
        {isFinished? "Finish" : isApproved ? <CircularProgress size={24} /> : "Approve"}
      </Button>
    </Paper>
  );
};

export default ApproveTransaction;