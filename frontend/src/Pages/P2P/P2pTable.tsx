import { Box, Chip, TextField, Grid, MenuItem, Select, FormControl, InputLabel, Stack, Button } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import React, { useState, useEffect } from "react";
import { useP2pValues, useP2pActions } from "../../hooks/useP2pLendingState";
import {
    P2pBorrowingRequest,
    P2pLendingRequest,
} from "../../api/backend/types/p2pTypes";

type RequestType = P2pBorrowingRequest | P2pLendingRequest;


function renderType(type: 'Borrow' | 'Lend') {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' } = {
        Borrow: 'primary',
        Lend: 'secondary',
    };

    return <Chip label={type} color={colors[type]} size="small" />;
}


function renderStatus(status:  "Filled" | "Partial Filled" | "Not Filled" | "Cancelled" ) {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' } = {
      "Not Filled": "primary",
        Cancelled: "secondary",
      "Partial Filled": "warning",
        Filled: "success",
    };

    return <Chip label={status} color={colors[status]} size="small" />;
}


const alertSelected = (params: any) => {
    alert('selected');
    alert(params.row.interestRate);
};

const borrowingRequestColumns: GridColDef[] = [
    {
        field: 'type',
        headerName: 'Type',
        flex: 0.5,
        minWidth: 100,
        renderCell: (params) => renderType(params.value as any),
    },
    {
        field: 'status',
        headerName: 'Status',
        flex: 0.5,
        minWidth: 100,
        renderCell: (params) => renderStatus(params.value as any),
    },
    { field: 'amount', headerName: 'Amount', flex: 1.5, minWidth: 100 },
    { field: 'duration', headerName: 'Duration', flex: 1, minWidth: 100 },
    { field: 'interestRate', headerName: 'Interest Rate', flex: 1, minWidth: 100 },
    { field: 'collateral', headerName: 'Collateral', flex: 1, minWidth: 100 },
    { field: 'action', headerName: 'Action', flex: 1, minWidth: 100, renderCell: (params) => <Button variant="contained" color="primary" onClick={() => alertSelected(params)}>Select</Button> },
];



const P2pTable: React.FC = () => {
    const { allRequests } = useP2pValues();
    const { fetchAllRequests } = useP2pActions();

    useEffect(() => {
        fetchAllRequests();
    }, [fetchAllRequests]);

    const myName = 'Bob';
    const [showOnlyMe, setShowOnlyMe] = useState<string>('any');
    const [requestTypeFilter, setRequestTypeFilter] = useState<string>("borrow/lend");
    const [statusFilter, setStatusFilter] = useState<string>('Not Filled/Partial Filled');
    const [durationCondition, setDurationCondition] = useState<string>('any');
    const [durationFilter, setDurationFilter] = useState<string>('');
    const [interestRateCondition, setInterestRateCondition] = useState<string>('any');
    const [interestRateFilter, setInterestRateFilter] = useState<string>('');
    const [collateralCondition, setCollateralCondition] = useState<string>('any');
    const [collateralFilter, setCollateralFilter] = useState<string>('');

    // Combine requests into a single array for filtering
    const requestRows: RequestType[] = allRequests
    ? [...allRequests.borrowRequests, ...allRequests.lendRequests]
    : [];


    const filteredRows = requestRows.map(row => {
        const isBorrowRequest = (row as P2pBorrowingRequest).borrower !== undefined;
        const borrower = isBorrowRequest ? (row as P2pBorrowingRequest).borrower : '_';
        const lender = isBorrowRequest ? '_' : (row as P2pLendingRequest).lender;
        const type = isBorrowRequest ? "Borrow" : "Lend";
        const duration = isBorrowRequest ? (row as P2pBorrowingRequest).paymentDuration : (row as P2pLendingRequest).paymentDuration;
        const interestRate = isBorrowRequest ? (row as P2pBorrowingRequest).desiredInterestRate : (row as P2pLendingRequest).desiredInterestRate;
        const initialCollateralAmountXrp = isBorrowRequest ? (row as P2pBorrowingRequest).initialCollateralAmountXrp : 0;
        const minCollateralRatio = isBorrowRequest ? 0 : (row as P2pLendingRequest).minCollateralRatio;
        const maxCollateralRatio = isBorrowRequest ? (row as P2pBorrowingRequest).maxCollateralRatio : 0;
        const amountToBorrowUsd = isBorrowRequest ? (row as P2pBorrowingRequest).amountToBorrowUsd : 0;
        const amountBorrowedUsd = isBorrowRequest ? (row as P2pBorrowingRequest).amountBorrowedUsd : 0;
        const amountToLendUsd = isBorrowRequest ? 0 : (row as P2pLendingRequest).amountToLendUsd;
        const amountLendedUsd = isBorrowRequest ? 0 : (row as P2pLendingRequest).amountLendedUsd;
        const collateral = isBorrowRequest ? maxCollateralRatio : minCollateralRatio;
         const status = row.canceled
              ? "Cancelled"
              : (isBorrowRequest ? (amountBorrowedUsd === amountToBorrowUsd
                      ? "Filled"
                      : amountBorrowedUsd > 0
                          ? "Partial Filled"
                          : "Not Filled") : (amountLendedUsd === amountToLendUsd
                  ? "Filled"
                  : amountLendedUsd > 0
                      ? "Partial Filled"
                      : "Not Filled"));


        const amountDisplay = status === "Partial Filled"
            ? (isBorrowRequest
              ? `${amountToBorrowUsd - amountBorrowedUsd} / ${amountToBorrowUsd}`
              : `${amountToLendUsd - amountLendedUsd} / ${amountToLendUsd}`
            )
            : (isBorrowRequest ? amountToBorrowUsd : amountToLendUsd);


        return {
            id: isBorrowRequest ? (row as P2pBorrowingRequest).requestId : (row as P2pLendingRequest).requestId,
            type: type,
            status: status,
            amount: amountDisplay,
            duration: duration,
            interestRate: interestRate,
            collateral: collateral,
            borrower: borrower,
            lender: lender
        }
    }).filter(row => {
        return (
            (showOnlyMe === "any" ||
                (showOnlyMe === "true" && (row.borrower === myName || row.lender === myName)) ||
                (showOnlyMe === "false" && row.borrower !== myName && row.lender !== myName)) &&
            (requestTypeFilter === "borrow/lend" ||
                !row.type.toLowerCase().includes(requestTypeFilter.toLowerCase())) &&
            (statusFilter === "any" ||
                (statusFilter === "Not Filled/Partial Filled" && (row.status === "Not Filled" || row.status === "Partial Filled")) ||
                row.status.toLowerCase().includes(statusFilter.toLowerCase())) &&
            (durationCondition === "any" ||
                durationFilter === "" ||
                (durationCondition === "greater" &&
                    row.duration > parseInt(durationFilter)) ||
                (durationCondition === "less" &&
                    row.duration < parseInt(durationFilter)) ||
                (durationCondition === "equal" &&
                    row.duration === parseInt(durationFilter))) &&
            (interestRateCondition === "any" ||
                interestRateFilter === "" ||
                (interestRateCondition === "greater" &&
                    row.interestRate > parseFloat(interestRateFilter)) ||
                (interestRateCondition === "less" &&
                    row.interestRate < parseFloat(interestRateFilter)) ||
                (interestRateCondition === "equal" &&
                    row.interestRate === parseFloat(interestRateFilter))) &&
            (collateralCondition === "any" ||
                collateralFilter === "" ||
                (collateralCondition === "greater" &&
                    row.collateral > parseFloat(collateralFilter)) ||
                (collateralCondition === "less" &&
                    row.collateral < parseFloat(collateralFilter)) ||
                (collateralCondition === "equal" &&
                    row.collateral === parseFloat(collateralFilter)))
        );
    });


    return (
        <Stack display="flex" flexDirection="column" justifyContent="flex-start" p={2}>
            <Grid container spacing={2} mb={2} style={{ marginTop: '10px' }}>
                <Grid item xs={2}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                            label="Borrow/Lend"
                            value={requestTypeFilter}
                            onChange={(e) => setRequestTypeFilter(e.target.value)}
                        >
                            <MenuItem value="borrow/lend">Borrow/Lend</MenuItem>
                            <MenuItem value="Borrow">Borrow</MenuItem>
                            <MenuItem value="Lend">Lend</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="any">Any</MenuItem>
                             <MenuItem value="Not Filled/Partial Filled">Not Filled/Partial Filled</MenuItem>
                            <MenuItem value="Not Filled">Not Filled</MenuItem>
                            <MenuItem value="Partial Filled">Partial Filled</MenuItem>
                            <MenuItem value="Filled">Filled</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Involve Me</InputLabel>
                        <Select
                            label="My Contract"
                            value={showOnlyMe}
                            onChange={(e) => setShowOnlyMe(e.target.value)}
                        >
                            <MenuItem value='any'>Any</MenuItem>
                            <MenuItem value='true'>True</MenuItem>
                            <MenuItem value='false'>False</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Duration</InputLabel>
                        <Select
                            label="Duration"
                            value={durationCondition}
                            onChange={(e) => setDurationCondition(e.target.value)}
                        >
                            <MenuItem value="any">Any</MenuItem>
                            <MenuItem value="greater">Greater than</MenuItem>
                            <MenuItem value="less">Less than</MenuItem>
                            <MenuItem value="equal">Equal to</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="Duration Value"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={durationFilter}
                        onChange={(e) => setDurationFilter(e.target.value)}
                        disabled={durationCondition === 'any'}
                        InputProps={{
                            style: {
                                backgroundColor: durationCondition === 'any' ? '#f0f0f0' : 'inherit',
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Interest Rate</InputLabel>
                        <Select
                            label="Interest Rate"
                            value={interestRateCondition}
                            onChange={(e) => setInterestRateCondition(e.target.value)}
                        >
                            <MenuItem value="any">Any</MenuItem>
                            <MenuItem value="greater">Greater than</MenuItem>
                            <MenuItem value="less">Less than</MenuItem>
                            <MenuItem value="equal">Equal to</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="Interest Rate Value"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={interestRateFilter}
                        onChange={(e) => setInterestRateFilter(e.target.value)}
                        disabled={interestRateCondition === 'any'}
                        InputProps={{
                            style: {
                                backgroundColor: interestRateCondition === 'any' ? '#f0f0f0' : 'inherit',
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Collateral</InputLabel>
                        <Select
                            label="Collateral"
                            value={collateralCondition}
                            onChange={(e) => setCollateralCondition(e.target.value)}
                        >
                            <MenuItem value="any">Any</MenuItem>
                            <MenuItem value="greater">Greater than</MenuItem>
                            <MenuItem value="less">Less than</MenuItem>
                            <MenuItem value="equal">Equal to</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="Collateral Value"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={collateralFilter}
                        onChange={(e) => setCollateralFilter(e.target.value)}
                        disabled={collateralCondition === 'any'}
                        InputProps={{
                            style: {
                                backgroundColor: collateralCondition === 'any' ? '#f0f0f0' : 'inherit',
                            },
                        }}
                    />
                </Grid>
            </Grid>
            <DataGrid
                rows={filteredRows}
                columns={borrowingRequestColumns}
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                }
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                pageSizeOptions={[10, 20, 50]}
                disableColumnResize
                density="compact"
            />
            <Button variant="contained" color="primary">
                Submit New Lending/Borrowing Request
            </Button>
        </Stack>
    );
};

export default P2pTable;