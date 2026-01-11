CREATE TABLE users
(
    id            UUID PRIMARY KEY,
    username      VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE user_roles
(
    user_id UUID        NOT NULL,
    role    VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
