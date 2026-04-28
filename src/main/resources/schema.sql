-- schema.sql
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS stock_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS issued_items;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    item_id BIGINT,
    quantity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by BIGINT,
    department_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE issued_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT,
    issued_to BIGINT,
    issued_by BIGINT,
    quantity INT NOT NULL,
    return_status VARCHAR(50),
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (issued_to) REFERENCES users(id),
    FOREIGN KEY (issued_by) REFERENCES users(id)
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE stock_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT,
    change_type VARCHAR(50),
    quantity INT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

SET FOREIGN_KEY_CHECKS = 1;