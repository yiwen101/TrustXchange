import React, { useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useP2pValues, useP2pActions } from '../../hooks/useP2pLendingState';
import P2pEventDropdown from './components/P2pEventDropdown';

const P2pDashboard: React.FC = () => {
    const {
        borrowingRequests,
        lendingRequests,
        loans,
        borrowingRequestEvents,
        lendingRequestEvents,
        loanEvents,
    } = useP2pValues();
    const { init, fetchBorrowingRequestEventsByRequestId, fetchLendingRequestEventsByRequestId, fetchLoanEventsByLoanId } = useP2pActions();
    const userAddress = "0x1234567890"; // Replace with your actual user address

    useEffect(() => {
        init();
    }, [init]);


    const handleShowEventsBorrowRequest = async (requestId:number) => {
         await fetchBorrowingRequestEventsByRequestId(requestId);
    };

   const handleShowEventsLendRequest = async (requestId:number) => {
        await fetchLendingRequestEventsByRequestId(requestId);
    };

    const handleShowEventsLoan = async (loanId:number) => {
        await fetchLoanEventsByLoanId(loanId);
    };


    // Filter requests and loans by the user address
    const userBorrowRequests = borrowingRequests.filter((req) => req.borrower === userAddress);
    const userLendRequests = lendingRequests.filter((req) => req.lender === userAddress);
    const userLoansAsBorrower = loans.filter((loan) => loan.borrower === userAddress);
    const userLoansAsLender = loans.filter((loan) => loan.lender === userAddress);


    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                P2P Dashboard
            </Typography>

            <Typography variant="h5" gutterBottom>
                My Borrow Requests
            </Typography>
           <Grid container spacing={3}>
                {userBorrowRequests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} key={request.requestId}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                     Borrow Request ID : {request.requestId}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Amount to Borrow: ${request.amountToBorrowUsd}
                                </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                    Collateral Amount: {request.initialCollateralAmountXrp} XRP
                                </Typography>
                                   <Typography variant="body2" color="text.secondary">
                                       Amount Borrowed: ${request.amountBorrowedUsd}
                                   </Typography>
                            </CardContent>
                            <CardActions>
                                  <Button size="small" onClick={() => handleShowEventsBorrowRequest(request.requestId)}>Show Events</Button>
                             </CardActions>
                               {borrowingRequestEvents.length > 0 ?
                                    <P2pEventDropdown events={borrowingRequestEvents} type='request' /> : null
                                }
                        </Card>
                    </Grid>
                ))}
            </Grid>


            <Typography variant="h5" gutterBottom>
                My Lending Requests
            </Typography>
             <Grid container spacing={3}>
                {userLendRequests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} key={request.requestId}>
                         <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    Lend Request ID : {request.requestId}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                     Amount to Lend: ${request.amountToLendUsd}
                                </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                     Amount Lended: ${request.amountLendedUsd}
                                </Typography>
                            </CardContent>
                              <CardActions>
                                  <Button size="small" onClick={() => handleShowEventsLendRequest(request.requestId)}>Show Events</Button>
                             </CardActions>
                                {lendingRequestEvents.length > 0 ?
                                    <P2pEventDropdown events={lendingRequestEvents} type='request' /> : null
                                }
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" gutterBottom>
                My Loans as Borrower
            </Typography>
             <Grid container spacing={3}>
                {userLoansAsBorrower.map((loan) => (
                    <Grid item xs={12} sm={6} md={4} key={loan.loanId}>
                         <Card>
                            <CardContent>
                                 <Typography variant="h6">
                                    Loan ID : {loan.loanId}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Amount Borrowed: ${loan.amountBorrowedUsd}
                                </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                     Amount Payable: ${loan.amountPayableToLender}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                   Collateral Amount: {loan.collateralAmountXrp} XRP
                                </Typography>
                            </CardContent>
                            <CardActions>
                                  <Button size="small" onClick={() => handleShowEventsLoan(loan.loanId)}>Show Events</Button>
                            </CardActions>
                            {loanEvents.length > 0 ?
                                    <P2pEventDropdown events={loanEvents} type='loan' /> : null
                            }
                        </Card>
                    </Grid>
                ))}
             </Grid>


            <Typography variant="h5" gutterBottom>
                My Loans as Lender
            </Typography>
             <Grid container spacing={3}>
                {userLoansAsLender.map((loan) => (
                    <Grid item xs={12} sm={6} md={4} key={loan.loanId}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                     Loan ID : {loan.loanId}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Amount Borrowed: ${loan.amountBorrowedUsd}
                                </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                    Amount Payable: ${loan.amountPayableToLender}
                                </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Collateral Amount: {loan.collateralAmountXrp} XRP
                                </Typography>
                            </CardContent>
                            <CardActions>
                               <Button size="small" onClick={() => handleShowEventsLoan(loan.loanId)}>Show Events</Button>
                            </CardActions>
                                {loanEvents.length > 0 ?
                                    <P2pEventDropdown events={loanEvents} type='loan' /> : null
                                }
                         </Card>
                    </Grid>
                ))}
            </Grid>


        </Container>
    );
};

export default P2pDashboard;