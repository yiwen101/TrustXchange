import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useP2pActions } from '../../hooks/useP2pLendingState';
import { useConnectedWalletValues } from '../../hooks/useConnectedWallet';
import {NewRequestFormProps} from '../../Component/RequestManager';

const NewRequestForm: React.FC<NewRequestFormProps> = ({open, onClose,onSubmit}: NewRequestFormProps) => {
    const {handleCreateBorrowRequest, handleCreateLendRequest} = useP2pActions();
    const {connectedWallet} = useConnectedWalletValues();
    const [isLending, setIsLending] = useState(false);
    const [amount, setAmount] = useState('');
    const [collateralRatio, setCollateralRatio] = useState('150');
    const [interestRate, setInterestRate] = useState('10');
    const [duration, setDuration] = useState('');
    const [partialFill, setPartialFill] = useState('');
    const [liquidationThreshold, setLiquidationThreshold] = useState('100');
    
    const handleSubmit = () => {
        console.log("Form Submitted:",{
          amount, collateralRatio, interestRate, duration, partialFill, isLending
        });
        if (isLending) {
            const callback = async () => {
                await handleCreateLendRequest(
                connectedWallet!,
                 Math.floor(parseFloat(amount)),
                 Math.floor(parseFloat(collateralRatio)),
                parseFloat(liquidationThreshold),
                Math.floor(parseFloat(interestRate)),
                parseInt(duration),
                Math.floor(parseFloat(partialFill)),
                connectedWallet!.classicAddress,
            );}
          onSubmit(callback);
        } else {
            const callback = async () => {
                await handleCreateBorrowRequest(
                connectedWallet!,
                Math.floor(parseFloat(amount)),
                Math.floor(parseFloat(partialFill) * parseFloat(collateralRatio) / 100),
                Math.floor(parseFloat(collateralRatio)),
                parseInt(liquidationThreshold),
                100 + Math.floor(parseFloat(interestRate)),
                parseInt(duration),
                Math.floor(parseFloat(interestRate)),
                connectedWallet!.classicAddress,
            );
        }
        onSubmit(callback);
        };
    };

    return (
      <Dialog open={open} onClose={onClose}>
          <DialogTitle>{isLending ? "New Lending Request" : "New Borrowing Request"}</DialogTitle>
          <DialogContent>
              <TextField
                  label="Amount (USD)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
              />
               <TextField
                  label={isLending ? "Minimum Collateral Ratio" : "Max Collateral Ratio" + "%"}
                  type="number"
                  fullWidth
                  margin="normal"
                  value={collateralRatio}
                   onChange={(e) => setCollateralRatio(e.target.value)}
              />
              <TextField
                  label={isLending ? "Minimum Interest Rate" : "Max Interest Rate" + "% (annual simple)"}
                  type="number"
                  fullWidth
                  margin="normal"
                   value={interestRate}
                   onChange={(e) => setInterestRate(e.target.value)}
              />
               <TextField
                  label="Payment Duration (Days)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={duration}
                   onChange={(e) => setDuration(e.target.value)}
              />
                <TextField
                  label="Minimal Partial Fill (USD)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={partialFill}
                   onChange={(e) => setPartialFill(e.target.value)}
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={onClose} color="primary">
                  Cancel
              </Button>
              <Button onClick={() => setIsLending(!isLending)} color="primary">
                  Switch to {isLending ? "Borrow" : "Lend"}
              </Button>
              <Button onClick={handleSubmit} color="primary">
                  Submit
              </Button>
          </DialogActions>
      </Dialog>
    );
}

export default NewRequestForm;