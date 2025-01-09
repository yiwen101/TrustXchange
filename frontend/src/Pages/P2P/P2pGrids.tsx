import React from 'react';
import {
  Grid,
  Stack
} from "@mui/material";
import RequestCard from "./P2pGridCard";
import RequestButton from "./P2pForm";
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
    <Stack display="flex" flexDirection="column" justifyContent="flex-start" p={2}>
      <Grid container spacing={2}>
        {rows.map((row, index) => (
          <RequestCard key={index} row={row} />
        ))}
      </Grid>
      <RequestButton />
    </Stack>
  );
};

export default P2pCardGrid;