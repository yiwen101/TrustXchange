import React from 'react';
import {
  Box,
  Grid,
  Stack
} from "@mui/material";
import RequestCard from "./P2pGridCard";
import RequestButton from "./RequestButton";
import {
    P2pBorrowingRequest,
    P2pLendingRequest
} from "../../api/backend/types/p2pTypes";

type RequestType = P2pBorrowingRequest | P2pLendingRequest;

interface P2pCardGridProps {
    rows: RequestType[];
}

const P2pCardGrid: React.FC<P2pCardGridProps> = ({rows}) => {

  return (
    <Box sx={{ maxHeight: '500px', width: '100%', overflow: 'auto' }}>
      <Grid container spacing={2}>
        {rows.map((row, index) => (
          <RequestCard key={index} row={row} />
        ))}
      </Grid>
      
    </Box>
  );
};

export default P2pCardGrid;