CREATE TABLE pool_lending_contributor (
    address VARCHAR(255) PRIMARY KEY,
    contribution_balance BIGINT NOT NULL DEFAULT 0,
    reward_debt BIGINT NOT NULL DEFAULT 0,
    confirmed_rewards BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pool_lending_borrower (
    borrower_address VARCHAR(255) PRIMARY KEY,
    borrow_amount_usd BIGINT NOT NULL DEFAULT 0,
    amount_payable_usd BIGINT NOT NULL DEFAULT 0,
    collateral_amount_xrp BIGINT NOT NULL DEFAULT 0,
    last_payable_update_time TIMESTAMP,
    repaid_usd BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pool_lending_borrower_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    amount BIGINT,
    borrower_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (borrower_address) REFERENCES pool_lending_borrower(borrower_address)
);


CREATE TABLE pool_lending_contributor_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
     amount BIGINT,
    contributor_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contributor_address) REFERENCES pool_lending_contributor(address)
);


CREATE TABLE pool_lending_pool_events (
   id SERIAL PRIMARY KEY,
   reward_distributed BIGINT,
   acc_reward_per_share_e18 BIGINT,
   equity BIGINT,
    retained_earning BIGINT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pool_lending_borrower_events_borrower_address ON pool_lending_borrower_events (borrower_address);
CREATE INDEX idx_pool_lending_contributor_events_contributor_address ON pool_lending_contributor_events (contributor_address);