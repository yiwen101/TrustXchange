// InputCard.tsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, TextField, Stack } from '@mui/material';

interface InputCardProps {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const InputCard: React.FC<InputCardProps> = ({ icon, value, onChange, disabled }) => {
  return (
    <Card style={{ padding: '10px', marginTop: '10px' }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        {icon}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '1.2rem',
            backgroundColor: 'transparent'
          }}
          disabled={disabled}
        />
      </Stack>
    </Card>
  );
};

InputCard.propTypes = {
  icon: PropTypes.element.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InputCard;