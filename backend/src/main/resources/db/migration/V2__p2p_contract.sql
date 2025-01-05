CREATE TABLE p2p_borrowing_requests (
    request_id INT PRIMARY KEY,
    borrower VARCHAR(255),
    amount_to_borrow_usd BIGINT,
    amount_borrowed_usd BIGINT,
    initial_collateral_amount_xrp BIGINT,
    existing_collateral_amount_xrp BIGINT,
    max_collateral_ratio BIGINT,
    liquidation_threshold BIGINT,
    desired_interest_rate BIGINT,
    payment_duration BIGINT,
    minimal_partial_fill BIGINT,
    canceled BOOLEAN,
    canceled_by_system BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE p2p_lending_requests (
    request_id INT PRIMARY KEY,
    lender VARCHAR(255),
    amount_to_lend_usd BIGINT,
    amount_lended_usd BIGINT,
    min_collateral_ratio BIGINT,
    liquidation_threshold BIGINT,
    desired_interest_rate BIGINT,
    payment_duration BIGINT,
    minimal_partial_fill BIGINT,
    canceled BOOLEAN,
    canceled_by_system BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE p2p_loans (
    loan_id INT PRIMARY KEY,
    lender VARCHAR(255),
    borrower VARCHAR(255),
    amount_borrowed_usd BIGINT,
    amount_payable_to_lender BIGINT,
    amount_payable_to_platform BIGINT,
    amount_paid_usd BIGINT,
    collateral_amount_xrp BIGINT,
    repay_by TIMESTAMP,
    liquidation_threshold BIGINT,
    is_liquidated BOOLEAN,
    lend_request_id INT,  
    borrow_request_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE p2p_lending_request_events (
    transaction_hash VARCHAR(255) PRIMARY KEY NOT NULL,
    transaction_url VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    request_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES p2p_lending_requests(request_id)
);

CREATE TABLE p2p_borrowing_request_events (
    transaction_hash VARCHAR(255) PRIMARY KEY NOT NULL,
    transaction_url VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    request_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES p2p_borrowing_requests(request_id)
);

CREATE TABLE p2p_loan_events (
    transaction_hash VARCHAR(255) PRIMARY KEY NOT NULL,
    transaction_url VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    amount BIGINT,
    loan_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES p2p_loans(loan_id)
);

CREATE INDEX idx_p2p_borrowing_requests_borrower ON p2p_borrowing_requests (borrower);
CREATE INDEX idx_p2p_lending_requests_lender ON p2p_lending_requests (lender);
CREATE INDEX idx_p2p_loans_lender ON p2p_loans (lender);
CREATE INDEX idx_p2p_loans_borrower ON p2p_loans (borrower);