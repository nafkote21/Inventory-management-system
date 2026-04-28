-- data.sql
-- admin@astu.edu.et / 123456
-- head@astu.edu.et / 123456
-- store@astu.edu.et / 123456
-- inst1@astu.edu.et / 123456
-- officer@astu.edu.et / 123456

INSERT INTO users (name, email, password, role, department_id) VALUES
('Admin User', 'admin@astu.edu.et', '$2a$10$avW5wi5qHQfvqYIB2BPTXewFRfGL/rMpRQIAa7klVadptn/IJZe1a', 'admin', NULL),
('Dept Head CS', 'head@astu.edu.et', '$2a$10$avW5wi5qHQfvqYIB2BPTXewFRfGL/rMpRQIAa7klVadptn/IJZe1a', 'dept_head', 1),
('Inv Officer', 'officer@astu.edu.et', '$2a$10$avW5wi5qHQfvqYIB2BPTXewFRfGL/rMpRQIAa7klVadptn/IJZe1a', 'inventory_officer', NULL),
('Store Keeper', 'store@astu.edu.et', '$2a$10$avW5wi5qHQfvqYIB2BPTXewFRfGL/rMpRQIAa7klVadptn/IJZe1a', 'storekeeper', NULL),
('Instructor CS', 'inst1@astu.edu.et', '$2a$10$avW5wi5qHQfvqYIB2BPTXewFRfGL/rMpRQIAa7klVadptn/IJZe1a', 'instructor', 1);

INSERT INTO departments (name) VALUES
('Computer Science'),
('Electrical Engineering'),
('Mechanical Engineering');

INSERT INTO items (name, category, quantity, reorder_level, description, created_at) VALUES
('Laptop', 'Electronics', 10, 2, 'Dell laptops', NOW()),
('Projector', 'Electronics', 5, 1, 'HD Projectors', NOW()),
('Notebook', 'Stationery', 100, 10, 'A4 notebooks', NOW());