import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, IconButton, Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OptionPayoffChart } from './OptionPayoffChart';
import { useOptionParams } from '../../hooks/useOptionParams';

const OptionDetail: React.FC = () => {
    const { optionType, strikePrice, expirationDate, isValid } = useOptionParams();
    const navigate = useNavigate();

    // 如果参数无效，返回到期权表格页面
    if (!isValid) {
        navigate('/future');
        return null;
    }

    return (
        <Container>
            <IconButton onClick={() => navigate('/future')}>
                <ArrowBackIcon /> Back
            </IconButton>
            <Typography variant="h6">
                {optionType} Option (Strike: ${strikePrice}, Expires: {expirationDate})
            </Typography>
            <OptionPayoffChart 
                strikePrice={strikePrice}
                currentPrice={29}
                optionPrice={1}
                optionType={optionType}
            />
        </Container>
    );
};

export default OptionDetail; 