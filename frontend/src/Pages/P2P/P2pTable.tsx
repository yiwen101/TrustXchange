import { Box, Chip, Button } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import React from "react";
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


interface P2pTableProps {
    rows: RequestType[];
}

const P2pTable: React.FC<P2pTableProps> = ({ rows }) => {

    const transformedRows = rows.map(row => {
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
            id: isBorrowRequest ? (row as P2pBorrowingRequest).requestId*2 : (row as P2pLendingRequest).requestId*2+1,
            type: type,
            status: status,
            amount: amountDisplay,
            duration: duration,
            interestRate: interestRate,
            collateral: collateral,
            borrower: borrower,
            lender: lender
        }
    })


  return (
    <Box sx={{ maxHeight: '520px', width: '100%', overflow: 'auto' }}>
      <DataGrid
        rows={transformedRows}
        columns={borrowingRequestColumns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        pageSizeOptions={[10]}
        disableColumnResize
        density="compact"
      />
    </Box>
  );
};

export default P2pTable;