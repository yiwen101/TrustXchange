CREATE TABLE block_examed (
    contract_name VARCHAR(255) PRIMARY KEY NOT NULL,
    last_examed_block_number BIGINT NOT NULL
);