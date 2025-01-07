import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

interface NewRequestFormProps {
    open: boolean;
    onClose: () => void;
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({open, onClose}: NewRequestFormProps) => {
    const [isLending, setIsLending] = useState(false);
    const [amount, setAmount] = useState('');
    const [collateralRatio, setCollateralRatio] = useState('150');
    const [interestRate, setInterestRate] = useState('10');
    const [duration, setDuration] = useState('');
    const [partialFill, setPartialFill] = useState('');
    
    const handleSubmit = () => {
        // TODO: Implement the actual submission logic.
        // You'll likely want to use `fetch` or a library like `axios` 
        // to send this data to your backend.
        console.log("Form Submitted:",{
          amount, collateralRatio, interestRate, duration, partialFill, isLending
        });
        if (onClose)
        onClose(); 
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