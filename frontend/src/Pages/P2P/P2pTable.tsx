import { Box, Chip, TextField, Grid, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import React, { useState } from "react";

function renderType (type: 'Borrow' | 'Lend') {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' } = {
        Borrow: 'primary',
        Lend: 'default',
    };
    
    return <Chip label={type} color={colors[type]} size="small" />;
}


function renderStatus(status: 'Waiting' | 'Cancelled' | 'Progress' | 'Paid' | 'Defaulted') {
  const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' } = {
    Waiting: 'primary',
    Cancelled: 'secondary',
    Progress: 'warning',
    Paid: 'success',
    Defaulted: 'error',
 };

  return <Chip label={status} color={colors[status]} size="small" />;
}

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
  { field: 'borrowingAmount', headerName: 'Borrowing Amount', flex: 1.5, minWidth: 100 },
  { field: 'duration', headerName: 'Duration', flex: 1, minWidth: 100 },
  { field: 'interestRate', headerName: 'Interest Rate', flex: 1, minWidth: 100 },
  { field: 'collateral', headerName: 'Collateral', flex: 1, minWidth: 100 },
  { field: 'borrower', headerName: 'Borrower', flex: 1, minWidth: 100 },
  { field: 'lender', headerName: 'Lender', flex: 1, minWidth: 100 },
  { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 100 },
];

const borrowingRequestRows: GridRowsProp = [
  { id: 1, type:'borrow',borrowingAmount: 1000, duration: 30, interestRate: 5, collateral: 500, status: 'Waiting', borrower: 'Alice', lender: 'Bob', startDate: '2021-10-01' },
  { id: 2, type:'borrow',borrowingAmount: 2000, duration: 60, interestRate: 6, collateral: 1100, status: 'Progress', borrower: 'Bob', lender: 'Alice', startDate: '2021-10-02' },
  { id: 3, type:'borrow',borrowingAmount: 3000, duration: 90, interestRate: 7, collateral: 1500, status: 'Paid', borrower: 'Charlie', lender: 'Alice', startDate: '2021-10-03' },
  { id: 4, type:'lend',borrowingAmount: 4000, duration: 120, interestRate: 8, collateral: 2500, status: 'Defaulted', borrower: 'David', lender: 'Bob', startDate: '2021-10-04' },
  { id: 5, type:'lend',borrowingAmount: 5000, duration: 150, interestRate: 9, collateral: 2500, status: 'Waiting', borrower: 'Eve', lender: 'Alice', startDate: '2021-10-05' },
  { id: 6, type:'lend',borrowingAmount: 5000, duration: 150, interestRate: 9, collateral: 2200, status: 'Cancelled', borrower: 'Eve', lender: 'Alice', startDate: '2021-10-05' },
];

const P2pTable: React.FC = () => {
    const [requestTypeFilter, setRequestTypeFilter] = useState("borrow/lend");
  const [statusFilter, setStatusFilter] = useState('');
  const [durationCondition, setDurationCondition] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [interestRateCondition, setInterestRateCondition] = useState('');
  const [interestRateFilter, setInterestRateFilter] = useState('');
  const [collateralCondition, setCollateralCondition] = useState('');
  const [collateralFilter, setCollateralFilter] = useState('');

  const filteredRows = borrowingRequestRows.filter((row) => {
    return (
      (requestTypeFilter === "borrow/lend" || row.type.toLowerCase().includes(requestTypeFilter.toLowerCase())) &&
      (statusFilter === '' || row.status.toLowerCase().includes(statusFilter.toLowerCase())) &&
      (durationCondition === '' || durationFilter === ''||(durationCondition === 'greater' && row.duration > parseInt(durationFilter)) ||
        (durationCondition === 'less' && row.duration < parseInt(durationFilter)) ||
        (durationCondition === 'equal' && row.duration === parseInt(durationFilter))) &&
      (interestRateCondition === '' || interestRateFilter === ''|| (interestRateCondition === 'greater' && row.interestRate > parseInt(interestRateFilter)) ||
        (interestRateCondition === 'less' && row.interestRate < parseInt(interestRateFilter)) ||
        (interestRateCondition === 'equal' && row.interestRate === parseInt(interestRateFilter))) &&
      (collateralCondition === '' || collateralFilter == ''|| (collateralCondition === 'greater' && row.collateral > parseInt(collateralFilter)) ||
        (collateralCondition === 'less' && row.collateral < parseInt(collateralFilter)) ||
        (collateralCondition === 'equal' && row.collateral === parseInt(collateralFilter)))
    );
  });

  return (
    <Box>
      <Box height={'100px'} />
      <Grid container spacing={2} mb={2}>
        <Grid item xs={3}>
            <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Type</InputLabel>
                <Select
                label="Borrow/Lend"
                value={requestTypeFilter}
                onChange={(e) => setRequestTypeFilter(e.target.value)}
                >
                <MenuItem value="borrow/lend">Borrow/Lend</MenuItem>
                <MenuItem value="borrow">Borrow</MenuItem>
                <MenuItem value="lend">Lend</MenuItem>
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Waiting">Waiting</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Progress">Progress</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Defaulted">Defaulted</MenuItem>
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
              <MenuItem value="">All</MenuItem>
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
              <MenuItem value="">All</MenuItem>
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
              <MenuItem value="">All</MenuItem>
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
    </Box>
  );
};

export default P2pTable;