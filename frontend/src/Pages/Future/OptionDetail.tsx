import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, IconButton, Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OptionPayoffChart } from '../../components/OptionPayoffChart';

const OptionDetail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const strikePrice = Number(searchParams.get('strike'));
    const optionType = searchParams.get('type') as 'Call' | 'Put';

    return (
        <Container>
            <IconButton onClick={() => navigate('/future')}>
                <ArrowBackIcon /> Back
            </IconButton>
            <OptionPayoffChart 
                strikePrice={strikePrice}
                currentPrice={29}
                premium={1.0}
                optionType={optionType}
            />
        </Container>
    );
};

export default OptionDetail; 