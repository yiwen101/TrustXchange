import React from 'react';
import { Card, CardContent, Typography, Grid, Button, CardActions } from '@mui/material';
import { P2pBorrowingRequest, P2pLendingRequest } from '../../../api/backend/types/p2pTypes';


interface P2pRequestCardProps {
  request: P2pBorrowingRequest | P2pLendingRequest;
  type: 'borrow' | 'lend';
  onAccept: (id: number) => void;
}

const P2pRequestCard: React.FC<P2pRequestCardProps> = ({ request, type, onAccept }) => {

  const isBorrowRequest = type === 'borrow';

  const getRequestDetails = () => {
    if (isBorrowRequest) {
      const borrowRequest = request as P2pBorrowingRequest;
        return (
            <>
               <Typography variant="body2" color="text.secondary">
                   Amount to Borrow: ${borrowRequest.amountToBorrowUsd}
               </Typography>
                <Typography variant="body2" color="text.secondary">
                    Collateral Amount: {borrowRequest.initialCollateralAmountXrp} XRP
                </Typography>
                 <Typography variant="body2" color="text.secondary">
                     Max Collateral Ratio: {borrowRequest.maxCollateralRatio}
                 </Typography>
                <Typography variant="body2" color="text.secondary">
                    Liquidation Threshold: {borrowRequest.liquidationThreshold}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Desired Interest Rate: {borrowRequest.desiredInterestRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Payment Duration: {borrowRequest.paymentDuration} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Minimal Partial Fill: {borrowRequest.minimalPartialFill}
                </Typography>
            </>
        )
    } else {
      const lendRequest = request as P2pLendingRequest;
       return (
            <>
                <Typography variant="body2" color="text.secondary">
                    Amount to Lend: ${lendRequest.amountToLendUsd}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                   Min Collateral Ratio: {lendRequest.minCollateralRatio}
                </Typography>
                  <Typography variant="body2" color="text.secondary">
                      Liquidation Threshold: {lendRequest.liquidationThreshold}
                  </Typography>
                 <Typography variant="body2" color="text.secondary">
                     Desired Interest Rate: {lendRequest.desiredInterestRate}%
                 </Typography>
                <Typography variant="body2" color="text.secondary">
                    Payment Duration: {lendRequest.paymentDuration} days
                </Typography>
                 <Typography variant="body2" color="text.secondary">
                    Minimal Partial Fill: {lendRequest.minimalPartialFill}
                </Typography>
            </>
        )
    }
};

  const handleAccept = () => {
      onAccept(request.requestId);
  };


  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {isBorrowRequest ? 'Borrow Request' : 'Lend Request'}
        </Typography>
           {getRequestDetails()}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleAccept} >Accept</Button>
      </CardActions>
    </Card>
  );
};

export default P2pRequestCard;