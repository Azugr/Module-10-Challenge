-- Drop the database if it already exists to avoid duplication
DROP DATABASE IF EXISTS employees_db;

--Create a database
CREATE DATABASE employees_db;

--Use employees_db
\c employees_db;

--See database in use
SELECT current_database();
















