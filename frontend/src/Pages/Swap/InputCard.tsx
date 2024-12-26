// InputCard.tsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, TextField, Stack } from '@mui/material';

interface InputCardProps {
  icon: JSX.Element;
  value: string;
  onChange: (value: string) => void;
}

const InputCard: React.FC<InputCardProps> = React.memo(({ icon, value, onChange }) => (
  <Card style={{ padding: '10px', marginTop: '2px' }}>
    <Stack direction="row" alignItems="center">
      {icon}
      <TextField
        label="Amount"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ marginLeft: '10px', flex: 1 }}
      />
    </Stack>
  </Card>
));
InputCard.displayName = 'InputCard';

InputCard.propTypes = {
  icon: PropTypes.element.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InputCard;