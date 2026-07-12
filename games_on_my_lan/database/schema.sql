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

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    game_description TEXT,
    file_path TEXT NOT NULL UNIQUE,
    image_path TEXT UNIQUE,
    current_version VARCHAR(25) NOT NULL,
    author_id INTEGER NOT NULL,

    FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- INITIAL DATA
-- ===============

INSERT INTO roles (role_name)
VALUES
    ('member'),
    ('admin'),
    ('owner')
ON CONFLICT (role_name) DO NOTHING;