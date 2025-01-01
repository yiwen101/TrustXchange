-- Migration SQL for P2P Lending Platform

-- Table: borrowing_requests
CREATE TABLE borrowing_requests (
    request_id INT PRIMARY KEY,
    borrower VARCHAR(255) NOT NULL,
    amount_to_borrow_usd DECIMAL(20, 8) NOT NULL,
    amount_borrowed_usd DECIMAL(20, 8) NOT NULL,
    initial_collateral_amount_xrp DECIMAL(20, 8) NOT NULL,
    existing_collateral_amount_xrp DECIMAL(20, 8) NOT NULL,
    max_collateral_ratio DECIMAL(5, 4) NOT NULL,
    liquidation_threshold DECIMAL(5, 4) NOT NULL,
    desired_interest_rate DECIMAL(5, 4) NOT NULL,
    payment_duration BIGINT NOT NULL,  -- Stored as seconds
    minimal_partial_fill DECIMAL(5, 4) NOT NULL,
    canceled BOOLEAN NOT NULL,
    canceled_by_system BOOLEAN NOT NULL
);

-- Table: lending_requests
CREATE TABLE lending_requests (
    request_id INT PRIMARY KEY,
    lender VARCHAR(255) NOT NULL,
    amount_to_lend_usd DECIMAL(20, 8) NOT NULL,
    amount_lended_usd DECIMAL(20, 8) NOT NULL,
    min_collateral_ratio DECIMAL(5, 4) NOT NULL,
    liquidation_threshold DECIMAL(5, 4) NOT NULL,
    desired_interest_rate DECIMAL(5, 4) NOT NULL,
    payment_duration BIGINT NOT NULL, -- Stored as seconds
    minimal_partial_fill DECIMAL(5, 4) NOT NULL,
    canceled BOOLEAN NOT NULL,
    canceled_by_system BOOLEAN NOT NULL
);

-- Table: loans
CREATE TABLE loans (
    loan_id INT PRIMARY KEY,
    lender VARCHAR(255) NOT NULL,
    borrower VARCHAR(255) NOT NULL,
    amount_borrowed_usd DECIMAL(20, 8) NOT NULL,
    amount_payable_to_lender DECIMAL(20, 8) NOT NULL,
    amount_payable_to_platform DECIMAL(20, 8) NOT NULL,
    amount_paid_usd DECIMAL(20, 8) NOT NULL,
    collateral_amount_xrp DECIMAL(20, 8) NOT NULL,
    repay_by TIMESTAMP NOT NULL,
    liquidation_threshold DECIMAL(5, 4) NOT NULL,
    is_liquidated BOOLEAN NOT NULL
);

-- Table: p2p_borrowing_request_filled (RELATIONAL)
CREATE TABLE p2p_borrowing_request_filled (
    request_id INT NOT NULL,
    loan_id INT NOT NULL,
    PRIMARY KEY (request_id, loan_id),
    FOREIGN KEY (request_id) REFERENCES borrowing_requests(request_id),
);

-- Table: p2p_lending_request_filled (RELATIONAL)
CREATE TABLE p2p_lending_request_filled (
    request_id INT NOT NULL,
    loan_id INT NOT NULL,
    PRIMARY KEY (request_id, loan_id),
    FOREIGN KEY (request_id) REFERENCES lending_requests(request_id),
);


-- Add indexes for performance
CREATE INDEX idx_borrowing_requests_borrower ON borrowing_requests (borrower);
CREATE INDEX idx_lending_requests_lender ON lending_requests (lender);
CREATE INDEX idx_loans_lender ON loans (lender);
CREATE INDEX idx_loans_borrower ON loans (borrower);
CREATE INDEX idx_p2p_borrowing_request_filled_request_id ON p2p_borrowing_request_filled (request_id);
CREATE INDEX idx_p2p_borrowing_request_filled_loan_id ON p2p_borrowing_request_filled (loan_id);
CREATE INDEX idx_p2p_lending_request_filled_request_id ON p2p_lending_request_filled (request_id);
CREATE INDEX idx_p2p_lending_request_filled_loan_id ON p2p_lending_request_filled (loan_id);