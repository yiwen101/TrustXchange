CREATE TABLE gmp_count (
    name VARCHAR(255) PRIMARY KEY,
    count BIGINT NOT NULL
);

CREATE TABLE gmp_info (
    transaction_hash VARCHAR(255) PRIMARY KEY,
    contract_transaction_hash VARCHAR(255) NOT NULL,
    gateway_transaction_hash VARCHAR(255) NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    destination_chain_hex VARCHAR(255) NOT NULL,
    payload_hash VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    is_received BOOLEAN NOT NULL,
    is_approved BOOLEAN NOT NULL,
    in_called BOOLEAN NOT NULL,
);