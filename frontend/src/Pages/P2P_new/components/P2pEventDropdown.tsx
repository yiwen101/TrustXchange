import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { P2pBorrowingRequestEvent, P2pLendingRequestEvent, P2pLoanEvent } from '../../../api/backend/types/p2pTypes';


interface P2pEventDropdownProps {
    events: (P2pBorrowingRequestEvent | P2pLendingRequestEvent | P2pLoanEvent)[];
    type: 'request' | 'loan';
}

const P2pEventDropdown: React.FC<P2pEventDropdownProps> = ({ events, type }) => {
    const [expanded, setExpanded] = useState(false);

    const handleToggle = () => {
        setExpanded(!expanded);
    };


    const getEventDetails = (event: P2pBorrowingRequestEvent | P2pLendingRequestEvent | P2pLoanEvent) => {
        if ('loanId' in event) {
             return (
                 <>
                 <Typography variant="body2" color="text.secondary">
                      Event Name: {event.eventName}
                  </Typography>
                 <Typography variant="body2" color="text.secondary">
                     Transaction Hash: {event.transactionHash}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                       Amount: {event.amount}
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                       Created At: {event.createdAt}
                  </Typography>
                </>
            )
        }else if('requestId' in event){
            return (
                <>
                     <Typography variant="body2" color="text.secondary">
                         Event Name: {event.eventName}
                     </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Transaction Hash: {event.transactionHash}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Created At: {event.createdAt}
                    </Typography>
                </>
            )

        }
    }

    return (
        <Accordion expanded={expanded} onChange={handleToggle}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography variant="subtitle1">Show Events</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {events.length > 0 ? (
                    events.map((event, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                           {getEventDetails(event)}
                        </div>
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary">
                       No events available.
                    </Typography>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default P2pEventDropdown;