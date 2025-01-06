import React from 'react';
import { Stack, Button, Typography } from '@mui/material';
import { XrpIcon, UsdcIcon } from '../../icons/Icons';
import InputCard from '../Swap/InputCard';
import { usePool } from '../../hooks/usePool';

const AddLiquidity = () => {
    const {
        xrpAmount,
        usdAmount,
        isLoading,
        addLiquidity,
        handleXrpAmountChange,
        handleUsdAmountChange
    } = usePool();

    return (
        <Stack spacing={2} style={{ marginTop: '20px' }}>
            <InputCard 
                icon={<XrpIcon />} 
                value={xrpAmount} 
                onChange={handleXrpAmountChange}
                label="XRP Amount"
            />
            <InputCard 
                icon={<UsdcIcon />} 
                value={usdAmount} 
                onChange={handleUsdAmountChange}
                label="USD Amount"
            />
            <Button
                variant="contained"
                onClick={() => addLiquidity(xrpAmount, usdAmount)}
                disabled={isLoading || !xrpAmount || !usdAmount}
            >
                {isLoading ? 'Adding Liquidity...' : 'Add Liquidity'}
            </Button>
        </Stack>
    );
};

export default AddLiquidity; 