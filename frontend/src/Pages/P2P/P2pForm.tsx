import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';


// ... existing CardGrid code ...

function NewRequestForm({open, onClose}) {
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


const RequestButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    };

    return (
    <>
         <Button variant="contained" color="primary" style={{marginTop: '10px'}} onClick={() => handleClickOpen(false)}>
            Submit New Borrowing Request
        </Button>
       
        <Button variant="contained" color="primary" style={{marginTop: '10px', marginLeft: '10px'}} onClick={() => handleClickOpen(true)}>
            Submit New Lending Request
        </Button>
       <NewRequestForm open={open} onClose={handleClose} />
    </>
    );
}

export default RequestButton;