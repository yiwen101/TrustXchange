// InputCard.tsx
import React from 'react';
import { Paper, InputBase, Box, Typography } from '@mui/material';

interface InputCardProps {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
}

const InputCard: React.FC<InputCardProps> = ({ 
  icon, 
  value, 
  onChange, 
  error, 
  helperText,
  label 
}) => {
  return (
    <Box>
      {label && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 0.5, ml: 1 }}
        >
          {label}
        </Typography>
      )}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          borderColor: error ? 'error.main' : 'divider'
        }}
      >
        {icon}
        <InputBase
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          sx={{
            fontSize: '1.1rem',
            '& input': {
              textAlign: 'right',
            }
          }}
        />
      </Paper>
      {error && helperText && (
        <Typography 
          variant="caption" 
          color="error" 
          sx={{ ml: 1, mt: 0.5 }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default InputCard;