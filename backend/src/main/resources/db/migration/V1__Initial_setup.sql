CREATE TABLE p2p_borrowing_requests (
    request_id INT PRIMARY KEY,
    borrower VARCHAR(255),
    amount_to_borrow_usd DOUBLE PRECISION,
    amount_borrowed_usd DOUBLE PRECISION,
    initial_collateral_amount_xrp DOUBLE PRECISION,
    existing_collateral_amount_xrp DOUBLE PRECISION,
    max_collateral_ratio DOUBLE PRECISION,
    liquidation_threshold DOUBLE PRECISION,
    desired_interest_rate DOUBLE PRECISION,
    payment_duration BIGINT,
    minimal_partial_fill DOUBLE PRECISION,
    canceled BOOLEAN,
    canceled_by_system BOOLEAN
);

CREATE TABLE p2p_lending_requests (
    request_id INT PRIMARY KEY,
    lender VARCHAR(255),
    amount_to_lend_usd DOUBLE PRECISION,
    amount_lended_usd DOUBLE PRECISION,
    min_collateral_ratio DOUBLE PRECISION,
    liquidation_threshold DOUBLE PRECISION,
    desired_interest_rate DOUBLE PRECISION,
    payment_duration BIGINT,
    minimal_partial_fill DOUBLE PRECISION,
    canceled BOOLEAN,
    canceled_by_system BOOLEAN
);

CREATE TABLE p2p_loans (
    loan_id INT PRIMARY KEY,
    lender VARCHAR(255),
    borrower VARCHAR(255),
    amount_borrowed_usd DOUBLE PRECISION,
    amount_payable_to_lender DOUBLE PRECISION,
    amount_payable_to_platform DOUBLE PRECISION,
    amount_paid_usd DOUBLE PRECISION,
    collateral_amount_xrp DOUBLE PRECISION,
    repay_by TIMESTAMP,
    liquidation_threshold DOUBLE PRECISION,
    is_liquidated BOOLEAN
);

CREATE TABLE p2p_borrowing_request_filled (
    loan_id INT PRIMARY KEY,
    request_id INT,
    FOREIGN KEY (request_id) REFERENCES p2p_borrowing_requests(request_id),
    FOREIGN KEY (loan_id) REFERENCES p2p_loans(loan_id)
);

CREATE TABLE p2p_lending_request_filled (
    loan_id INT PRIMARY KEY,
    request_id INT,
    FOREIGN KEY (request_id) REFERENCES p2p_lending_requests(request_id),
    FOREIGN KEY (loan_id) REFERENCES p2p_loans(loan_id)
);

CREATE INDEX idx_p2p_borrowing_requests_borrower ON p2p_borrowing_requests (borrower);
CREATE INDEX idx_p2p_lending_requests_lender ON p2p_lending_requests (lender);
CREATE INDEX idx_p2p_loans_lender ON p2p_loans (lender);
CREATE INDEX idx_p2p_loans_borrower ON p2p_loans (borrower);
CREATE INDEX idx_p2p_borrowing_request_filled_request_id ON p2p_borrowing_request_filled (request_id);
CREATE INDEX idx_p2p_lending_request_filled_request_id ON p2p_lending_request_filled (request_id);