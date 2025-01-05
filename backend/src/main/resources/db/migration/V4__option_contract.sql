-- Define ENUM types
CREATE TYPE option_type AS ENUM ('call', 'put');
CREATE TYPE option_action_type AS ENUM ('issue', 'exercise', 'collect_collateral');
CREATE TYPE option_order_type AS ENUM ('sell', 'buy');
CREATE TYPE option_trade_event_type AS ENUM ('create', 'fill', 'cancel');

-- Create the options table
CREATE TABLE options (
    id BIGSERIAL PRIMARY KEY,
    option_type option_type NOT NULL,
    strike_price BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    late_deal_price BIGINT DEFAULT NULL,
    first_bid BIGINT DEFAULT NULL,
    first_bid_amount BIGINT DEFAULT NULL,
    first_ask BIGINT DEFAULT NULL,
    first_ask_amount BIGINT DEFAULT NULL,
    daily_volume BIGINT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the option_events table
CREATE TABLE option_events (
    id BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(255) NOT NULL,
    transaction_url VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    option_id BIGINT NOT NULL,
    action action_type NOT NULL,
    amount BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES options(id)
);

-- Create the sell_orders table
CREATE TABLE option_orders (
    id BIGSERIAL PRIMARY KEY,
    option_id BIGINT NOT NULL,
    poster_address VARCHAR(255) NOT NULL,
    order_type option_order_type NOT NULL,
    price BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    filled_amount BIGINT NOT NULL,
    is_cancelled BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES options(id)
);

-- Create the trade_events table
CREATE TABLE option_order_events (
    id BIGSERIAL PRIMARY KEY,
    transaction_hash VARCHAR(255) NOT NULL,
    transaction_url VARCHAR(255) NOT NULL,
    option_id BIGINT NOT NULL,
    poster_address VARCHAR(255) NOT NULL,
    order_id BIGINT NOT NULL,
    deal_price BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    action option_trade_event_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES options(id),
    FOREIGN KEY (sell_order_id) REFERENCES option_sell_orders(id),
    FOREIGN KEY (buy_order_id) REFERENCES option_buy_orders(id)
);

-- Create the user_option_balances table
CREATE TABLE option_user_balances (
    id BIGSERIAL PRIMARY KEY,
    user_address VARCHAR(255) NOT NULL,
    option_id BIGINT NOT NULL,
    owned_amount BIGINT NOT NULL,
    selling_amount BIGINT NOT NULL,
    exercised_amount BIGINT NOT NULL,
    issued_amount BIGINT NOT NULL,
    collateral_collected_amount BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES options(id)
);