// src/components/ApproveTransaction.tsx

import React, { useState } from 'react';
import { Box, Typography, Divider, Button, Tooltip, Chip, Dialog, DialogContent, DialogActions } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import InfoIcon from '@mui/icons-material/Info';
import { USDC_issuer,MY_GATEWAY_IMPL_ADDRESS } from "../const";
import { useCurrentGMPCallState } from '../hooks/useCurrnetGMPCallState';
import { Link } from 'react-router-dom';
interface ApproveTransactionProps {
  open: boolean;
  currencyStr: string;
  onApprove: () => Promise<void>;
  onClose: () => void;
  onBack: () => void;
  contractAddress: string;
}

const ApproveTransaction: React.FC<ApproveTransactionProps> = ({ onApprove, onClose,open,currencyStr,onBack,contractAddress }) => {
  const [isApproved, setIsApproved] = useState(false);
  const { xrplTransaction, gatewayTransaction,evmTransaction, reset } = useCurrentGMPCallState();
  const onFinish = () => {
    onClose();
    reset();
    setIsApproved(false);
  }
  const handleButtonClicked = async () => {
    if (xrplTransaction && gatewayTransaction && evmTransaction) {
      onFinish();
      return;
    }

    try {
      setIsApproved(true);
      await onApprove();
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };
  const showLongTxHash = (hash: string) => {
    return hash.slice(0, 25) + "..." + hash.slice(-20);
  }
  const evmExplorerUrlOfTx = (hash: string) => {
    return `https://explorer.xrplevm.org/tx/${hash}`;
  }
  const evmExplorerUrlOfContract = (address: string) => {
    return `https://explorer.xrplevm.org/address/${address}`;
  }
  const xrplExplorerUrlOfTx = (hash: string) => {
    return `https://testnet.xrpl.org/transactions/${hash}`;
  }
  const xrplExplorerUrlOfAccount = (address: string) => {
    return `https://testnet.xrpl.org/accounts/${address}`;
  }



  return (
    <Dialog open={open} onClose={onClose}>
    <DialogContent sx={{ maxWidth: 600, padding: 3 }}>
      <Typography variant="h6" gutterBottom align="center">
        Approve the Transaction
      </Typography>

      {/* Sign and Create GMP Call Section */}
      <Box
        sx={{
          marginTop: 0,
          marginBottom: 0,
          padding: 2,
          borderRadius: 1,
          color: !isApproved ? 'grey.500' : 'inherit',
          opacity: !isApproved ? 0.6 : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Sign and create GMP call
        </Typography>
        {isApproved&&xrplTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Signed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link to = {xrplExplorerUrlOfTx(xrplTransaction)}>
                {showLongTxHash(xrplTransaction)}
              </Link>
            </Typography>
          </Box>
        )}
        {isApproved && !xrplTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Signing and Creating GMP Call on XRPL Testnet
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
          <Link to={xrplExplorerUrlOfAccount(USDC_issuer.address)}>
            {USDC_issuer.address}
          </Link>
        </Typography>
      </Box>

      <Divider sx={{ my: 0 }} />

      {/* Approval Contract Call Section */}
      <Box
        sx={{
          marginTop: 0,
          marginBottom: 0,
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
          Approval of the GMP Call by the Gateway
        </Typography>
        {!xrplTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HourglassBottomIcon />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Waiting for GMP Call to Multisig Wallet on XRPL Testnet
            </Typography>
          </Box>
        )}
        {xrplTransaction && gatewayTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Signed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link to = {evmExplorerUrlOfTx(gatewayTransaction)}>
                {showLongTxHash(gatewayTransaction)}
              </Link>
            </Typography>
          </Box>
        )}
        {xrplTransaction && !gatewayTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Axaler is approving the GMP Call to EVM Contract
            </Typography>
          </Box>
        )}
        <Chip label="EVM Sidechain Devnet" color="primary" size="small" sx={{ mt: 1 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          <Link to = {evmExplorerUrlOfContract(MY_GATEWAY_IMPL_ADDRESS)}>
              {MY_GATEWAY_IMPL_ADDRESS}
          </Link>
        </Typography>
      </Box>

      <Box
        sx={{
          marginTop: 0,
          marginBottom: 0,
          padding: 2,
          borderRadius: 1,
          color: !gatewayTransaction ? 'grey.500' : 'inherit',
          opacity: !gatewayTransaction ? 0.6 : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Execution of the approved GMP Call by the Contract
        </Typography>
        {!gatewayTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HourglassBottomIcon />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Waiting for GMP Call to be Approved by Gateway on EVM Sidechain
            </Typography>
          </Box>
        )}
        {gatewayTransaction && evmTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Signed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link to = {evmExplorerUrlOfTx(evmTransaction)}>
                {showLongTxHash(evmTransaction)}
              </Link>
            </Typography>
          </Box>
        )}
        {gatewayTransaction && !evmTransaction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Axaler is executing the GMP Call to EVM Contract
            </Typography>
          </Box>
        )}
        <Chip label="EVM Sidechain Devnet" color="primary" size="small" sx={{ mt: 1 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          <Link to = {evmExplorerUrlOfContract(contractAddress)}>
             {contractAddress}
          </Link>
        </Typography>
      </Box>


      {/* Transaction Details */}
      <Box sx={{ marginBottom: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1">Send</Typography>
          <Typography variant="body1">{currencyStr}</Typography>
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
        disabled={isApproved && !(xrplTransaction && gatewayTransaction && evmTransaction)}
      >
        {isApproved && !(xrplTransaction && gatewayTransaction && evmTransaction) ? <CircularProgress size={24} /> : isApproved ? 'Approve' : 'Finish'}
      </Button>
    </DialogContent>
    <DialogActions  sx={{
          padding: '8px 24px',
          marginTop: -2,
        }}>
        <Button onClick={onClose} color="primary">
            Cancel
        </Button>
        <Button onClick={onBack} color="primary">
            Back
        </Button>
    </DialogActions>
    </Dialog>
  );
};

export default ApproveTransaction;