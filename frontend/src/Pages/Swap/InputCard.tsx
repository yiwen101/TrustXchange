// InputCard.tsx
import React from 'react';
import { Card, Stack, Typography, TextField } from '@mui/material';

interface InputCardProps {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

const InputCard: React.FC<InputCardProps> = ({ icon, value, onChange, error, helperText }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input
    if (value === '') {
      onChange(value);
      return;
    }

    // Only allow valid number patterns
    if (/^\d*\.?\d*$/.test(value)) {
      // Prevent multiple decimal points
      if ((value.match(/\./g) || []).length <= 1) {
        // Prevent more than 6 decimal places
        const parts = value.split('.');
        if (parts.length === 2 && parts[1].length > 6) {
          return;
        }
        onChange(value);
      }
    }
  };

  return (
    <Card style={{ padding: '10px', marginTop: '10px' }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        {icon}
        <TextField
          fullWidth
          value={value}
          onChange={handleInputChange}
          placeholder="0.00"
          variant="standard"
          error={error}
          helperText={helperText}
          InputProps={{
            type: 'text',
            style: { fontSize: '20px' },
            inputProps: {
              pattern: '^[0-9]*[.]?[0-9]*$',
              inputMode: 'decimal',
            }
          }}
        />
      </Stack>
    </Card>
  );
};

export default InputCard;