import React, { useState, useEffect } from "react";
import {
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import RequestCard from "./P2pGridCard";
import RequestButton from "./P2pForm";
import { useP2pValues, useP2pActions } from "../../hooks/useP2pLendingState";
// Interfaces

import {
    P2pBorrowingRequest,
    P2pLendingRequest,
} from "../../api/backend/types/p2pTypes";

type RequestType = P2pBorrowingRequest | P2pLendingRequest;


const P2pCardGrid: React.FC = () => {
  const { allRequests } = useP2pValues();
  const { fetchAllRequests } = useP2pActions();

   useEffect(() => {
        fetchAllRequests();
    }, [fetchAllRequests]);


  const myName = "Bob"; //replace with your actual name
  const [showOnlyMe, setShowOnlyMe] = useState<string>("any");
  const [requestTypeFilter, setRequestTypeFilter] = useState("borrow/lend");
  const [statusFilter, setStatusFilter] = useState("Not Filled/Partial Filled");
  const [durationCondition, setDurationCondition] = useState("any");
  const [durationFilter, setDurationFilter] = useState("");
  const [interestRateCondition, setInterestRateCondition] = useState("any");
  const [interestRateFilter, setInterestRateFilter] = useState("");
  const [collateralCondition, setCollateralCondition] = useState("any");
  const [collateralFilter, setCollateralFilter] = useState("");

  // Combine requests into a single array for filtering
    const requestRows: RequestType[] = allRequests
    ? [...allRequests.borrowRequests, ...allRequests.lendRequests]
    : [];


  const filteredRows = requestRows.filter((row) => {
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

    return (
      (showOnlyMe === "any" ||
        (showOnlyMe === "true" && (borrower === myName || lender === myName)) ||
        (showOnlyMe === "false" && borrower !== myName && lender !== myName)) &&
      (requestTypeFilter === "borrow/lend" ||
       type.toLowerCase().includes(requestTypeFilter.toLowerCase())) &&
      (statusFilter === "any" ||
        (statusFilter === "Not Filled/Partial Filled" && (status === "Not Filled" || status === "Partial Filled")) ||
        status.toLowerCase().includes(statusFilter.toLowerCase())) &&
      (durationCondition === "any" ||
        durationFilter === "" ||
        (durationCondition === "greater" &&
          duration > parseInt(durationFilter)) ||
        (durationCondition === "less" &&
          duration < parseInt(durationFilter)) ||
        (durationCondition === "equal" &&
          duration === parseInt(durationFilter))) &&
      (interestRateCondition === "any" ||
        interestRateFilter === "" ||
        (interestRateCondition === "greater" &&
          interestRate > parseFloat(interestRateFilter)) ||
        (interestRateCondition === "less" &&
          interestRate < parseFloat(interestRateFilter)) ||
        (interestRateCondition === "equal" &&
          interestRate === parseFloat(interestRateFilter))) &&
      (collateralCondition === "any" ||
        collateralFilter === "" ||
        (collateralCondition === "greater" &&
          collateral > parseFloat(collateralFilter)) ||
        (collateralCondition === "less" &&
          collateral < parseFloat(collateralFilter)) ||
        (collateralCondition === "equal" &&
          collateral === parseFloat(collateralFilter)))
    );
  });

  return (
    <Stack display="flex" flexDirection="column" justifyContent="flex-start" p={2}>
      <Grid container spacing={2} mb={2} style={{ marginTop: "10px" }}>
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
              <MenuItem value="any">Any</MenuItem>
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
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
            disabled={durationCondition === "any"}
            InputProps={{
              style: {
                backgroundColor:
                  durationCondition === "any" ? "#f0f0f0" : "inherit",
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
            disabled={interestRateCondition === "any"}
            InputProps={{
              style: {
                backgroundColor:
                  interestRateCondition === "any" ? "#f0f0f0" : "inherit",
              },
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Collateral Ratio</InputLabel>
            <Select
              label="Collateral Ratio"
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
            label="Collateral Ratio Value"
            variant="outlined"
            size="small"
            fullWidth
            value={collateralFilter}
            onChange={(e) => setCollateralFilter(e.target.value)}
            disabled={collateralCondition === "any"}
            InputProps={{
              style: {
                backgroundColor:
                  collateralCondition === "any" ? "#f0f0f0" : "inherit",
              },
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {filteredRows.map((row) => (
          <RequestCard key={row.requestId} row={row} />
        ))}
      </Grid>
      <RequestButton />
    </Stack>
  );
};

export default P2pCardGrid;