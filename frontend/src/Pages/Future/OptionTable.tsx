import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const OptionTable: React.FC = () => {
    const navigate = useNavigate();

    const handleOptionClick = (strikePrice: number, optionType: string) => {
        navigate(`/future/option?strike=${strikePrice}&type=${optionType}`);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>firstAsk</TableCell>
                        <TableCell>firstBid</TableCell>
                        <TableCell>volume</TableCell>
                        <TableCell>price</TableCell>
                        <TableCell>Strike</TableCell>
                        <TableCell>price</TableCell>
                        <TableCell>volume</TableCell>
                        <TableCell>firstBid</TableCell>
                        <TableCell>firstAsk</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>0.63</TableCell>
                        <TableCell>0.57</TableCell>
                        <TableCell>398</TableCell>
                        <TableCell 
                            onClick={() => handleOptionClick(1.90, 'Call')}
                            style={{ cursor: 'pointer', color: 'blue' }}
                        >
                            0.61
                        </TableCell>
                        <TableCell>1.90</TableCell>
                        <TableCell 
                            onClick={() => handleOptionClick(1.90, 'Put')}
                            style={{ cursor: 'pointer', color: 'blue' }}
                        >
                            0.24
                        </TableCell>
                        <TableCell>1000</TableCell>
                        <TableCell>0.20</TableCell>
                        <TableCell>0.25</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default OptionTable; 