-- Insert data into the 'department' table first
INSERT INTO department (name) VALUES
('IT'),
('HR'),
('Finance'),
('Sales');

-- Insert data into the 'role' table next
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 70000, 1), -- IT Department
('HR Specialist', 50000, 2),    -- HR Department
('Accountant', 60000, 3),       -- Finance Department
('Sales Manager', 65000, 4);    -- Sales Department

-- Insert data into the 'employee' table last
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),       -- Top-level manager, no manager
('Jane', 'Smith', 2, 1),        -- Reports to John Doe
('Alice', 'Johnson', 3, NULL),  -- Top-level manager, no manager
('Bob', 'Brown', 4, 3);         -- Reports to Alice Johnson


