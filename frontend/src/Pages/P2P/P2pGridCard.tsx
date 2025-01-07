import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    Chip
  } from "@mui/material";
import {
    P2pBorrowingRequest,
    P2pLendingRequest
} from './P2pGrids';
import { renderType, renderStatus, alertSelected } from './P2pGrids';

interface RequestCardProps {
    row: P2pBorrowingRequest | P2pLendingRequest;
}

const alertSelected = (param:any) => {
    alert("selected");
    alert(param.desiredInterestRate || param.interestRate);
  };
  
function renderType(type: "Borrow" | "Lend") {
    const colors: {
      [key: string]:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "success"
      | "warning";
    } = {
      Borrow: "primary",
      Lend: "secondary",
    };
  
    return <Chip label={type} color={colors[type]} size="small" />;
  }
  
  function renderStatus(
    status: "Filled" | "Partial Filled" | "Not Filled" | "Cancelled"
  ) {
    const colors: {
      [key: string]:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "success"
      | "warning";
    } = {
      "Not Filled": "primary",
      Cancelled: "secondary",
      "Partial Filled": "warning",
      Filled: "success",
    };
  
    return <Chip label={status} color={colors[status]} size="small" />;
  }

const RequestCard: React.FC<RequestCardProps> = ({ row }) => {
    const isBorrowRequest = (row as P2pBorrowingRequest).borrower !== undefined;
    const type = isBorrowRequest ? "Borrow" : "Lend";
    const amountToBorrowUsd = isBorrowRequest ? (row as P2pBorrowingRequest).amountToBorrowUsd : 0;
    const amountBorrowedUsd = isBorrowRequest ? (row as P2pBorrowingRequest).amountBorrowedUsd : 0;
    const amountToLendUsd = isBorrowRequest ? 0 : (row as P2pLendingRequest).amountToLendUsd;
    const amountLendedUsd = isBorrowRequest ? 0 : (row as P2pLendingRequest).amountLendedUsd;
     const initialCollateralAmountXrp = isBorrowRequest ? (row as P2pBorrowingRequest).initialCollateralAmountXrp : 0;
    const minimalPartialFill = isBorrowRequest ? (row as P2pBorrowingRequest).minimalPartialFill : (row as P2pLendingRequest).minimalPartialFill;


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
     const collateralRatio = isBorrowRequest ? ((initialCollateralAmountXrp / amountToBorrowUsd) * 100).toFixed(2) : ((amountToLendUsd / initialCollateralAmountXrp) * 100).toFixed(2);

     const amountDisplay = status === "Partial Filled"
          ? (isBorrowRequest
            ? `${amountToBorrowUsd - amountBorrowedUsd} / ${amountToBorrowUsd}`
             : `${amountToLendUsd - amountLendedUsd} / ${amountToLendUsd}`
            )
         : (isBorrowRequest ? amountToBorrowUsd : amountToLendUsd);


    return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={isBorrowRequest ? (row as P2pBorrowingRequest).requestId : (row as P2pLendingRequest).requestId}>
            <Card>
                <CardContent>
                    <Stack display="flex" flexDirection="row" justifyContent="space-between">
                        <Typography variant="h6" component="div">
                            {renderType(type)}
                        </Typography>
                        <Typography component="div">
                            {renderStatus(status)}
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {status === "Partial Filled" ? "Remaining Amount: " : "Amount: "}
                        {amountDisplay}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Duration: {isBorrowRequest ? (row as P2pBorrowingRequest).paymentDuration : (row as P2pLendingRequest).paymentDuration} days
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isBorrowRequest ? "Max Interest Rate: " : "Min Interest Rate: "} {isBorrowRequest ? (row as P2pBorrowingRequest).desiredInterestRate : (row as P2pLendingRequest).desiredInterestRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isBorrowRequest ? "Max Collateral Ratio: " : "Min Collateral Ratio: "} {collateralRatio}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Minimal Partial Fill: {minimalPartialFill}
                    </Typography>
                    <Stack display="flex" flexDirection="row" justifyContent="flex-end" mt={2}>
                        <Button variant="contained" color="primary" onClick={() => alertSelected(row)}>
                            Select
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default RequestCard;