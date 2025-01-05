-- Modified SQL Schema

-- Create the options table
CREATE TABLE options (
    id BIGINT BIGSERIAL PRIMARY KEY,
    option_type ENUM('call', 'put') NOT NULL,
    strike_price BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    late_deal_price BIGINT DEFAULT NULL,
    first_bid BIGINT DEFAULT NULL,
    first_bid_amount BIGINT DEFAULT NULL,
    first_ask BIGINT DEFAULT NULL,
    first_ask_amount BIGINT DEFAULT NULL,
    daily_volume BIGINT DEFAULT NULL
);

-- Create the option_events table
CREATE TABLE option_events (
    id BIGINT BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(255) NOT NULL,
    transaction_url VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    option_id BIGINT NOT NULL,
    action ENUM('issue', 'exercise', 'collect_collateral') NOT NULL,
    amount BIGINT NOT NULL,
    FOREIGN KEY (option_id) REFERENCES options(id)
);

-- Create the trade_events table
CREATE TABLE trade_events (
    id BIGINT BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(255) NOT NULL,
    transaction_url VARCHAR(255) NOT NULL,
    buyer_address VARCHAR(255) NOT NULL,
    seller_address VARCHAR(255) NOT NULL,
    deal_price BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    sell_order_id BIGINT NOT NULL,
    buy_order_id BIGINT NOT NULL,
    FOREIGN KEY (option_id) REFERENCES options(id)
    FOREIGN KEY (sell_order_id) REFERENCES sell_orders(id)
    FOREIGN KEY (buy_order_id) REFERENCES buy_orders(id)
);

-- Create the sell_orders table
CREATE TABLE sell_orders (
    id BIGINT PRIMARY KEY,
    option_id BIGINT NOT NULL,
    seller_address VARCHAR(255) NOT NULL,
    price BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    filled_amount BIGINT NOT NULL,
    is_cancelled BOOLEAN NOT NULL,
    FOREIGN KEY (option_id) REFERENCES options(id)
);

-- Create the buy_orders table
CREATE TABLE buy_orders (
    id BIGINT PRIMARY KEY,
    option_id BIGINT NOT NULL,
    buyer_address VARCHAR(255) NOT NULL,
    price BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    filled_amount BIGINT NOT NULL,
    is_cancelled BOOLEAN NOT NULL,
    FOREIGN KEY (option_id) REFERENCES options(id)
);

-- Create the user_option_balances table
CREATE TABLE user_option_balances (
    id BIGINT BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(255) NOT NULL,
    option_id BIGINT NOT NULL,
    owned_amount BIGINT NOT NULL,
    selling_amount BIGINT NOT NULL,
    exercised_amount BIGINT NOT NULL,
    issued_amount BIGINT NOT NULL,
    collateral_collected_amount BIGINT NOT NULL,
    FOREIGN KEY (option_id) REFERENCES options(id)
);