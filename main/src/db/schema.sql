-- Drop the database if it already exists to avoid duplication
DROP DATABASE IF EXISTS employees_db;

-- Create the database
CREATE DATABASE employees_db;

-- Drop tables if they exist
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS employee_role CASCADE;
DROP TABLE IF EXISTS department CASCADE;

-- Create the department table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

-- Create the role table
CREATE TABLE employee_role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL REFERENCES department(id) ON DELETE CASCADE -- Reference department table
);

-- Create the employee table
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES employee_role(id) ON DELETE SET NULL, -- Reference employee_role
    manager_id INTEGER,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL, -- Nullify manager if the manager is deleted
    CONSTRAINT chk_manager_not_self CHECK (id <> manager_id) -- Ensure an employee cannot manage themselves
);








