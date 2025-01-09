CREATE TABLE gmp_count (
    name VARCHAR(255) PRIMARY KEY,
    count BIGINT NOT NULL
);

CREATE TABLE gmp_info (
    transaction_hash VARCHAR(255) PRIMARY KEY,
    evm_transaction_hash VARCHAR(255) NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    destination_chain_hex VARCHAR(255) NOT NULL,
    payload_hash VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    is_processing BOOLEAN NOT NULL,
    is_processed BOOLEAN NOT NULL
);