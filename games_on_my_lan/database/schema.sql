-- ===============
-- DATABASE SCHEMA
-- ===============

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(25) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    game_description TEXT,
    entry_file TEXT NOT NULL DEFAULT 'index.html',
    author_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- INITIAL DATA
-- ===============

INSERT INTO roles (role_name)
VALUES
    ('owner'),
    ('admin'),
    ('member')
ON CONFLICT (role_name) DO NOTHING;