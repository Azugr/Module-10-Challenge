const { Pool } = require('pg');

// Configure PostgreSQL Pool
const pool = new Pool({
  user: 'postgres', // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'employee_db', // Replace with your database name
  password: 'lucas920', // Replace with your PostgreSQL password
  port: 5432,
});

// Utility function to execute queries
const executeQuery = async (query, params = []) => {
  try {
    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    console.error('Database error:', error.message);
    throw error;
  }
};

// Helper function to validate input
const validateString = (input, fieldName) => {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }
};

const validateNumber = (input, fieldName) => {
  if (isNaN(input) || Number(input) <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }
};

// Department Queries
const viewAllDepartments = async () => executeQuery('SELECT * FROM department;');

const addDepartment = async (name) => {
  validateString(name, 'Department name');
  return executeQuery('INSERT INTO department (name) VALUES ($1) RETURNING *;', [name]);
};

const updateDepartmentName = async (id, newName) => {
  validateNumber(id, 'Department ID');
  validateString(newName, 'New department name');
  return executeQuery('UPDATE department SET name = $1 WHERE id = $2 RETURNING *;', [newName, id]);
};

const deleteDepartment = async (id) => {
  validateNumber(id, 'Department ID');
  return executeQuery('DELETE FROM department WHERE id = $1 RETURNING *;', [id]);
};

// Role Queries
const viewAllRoles = async () =>
  executeQuery(`
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id;
  `);

const addRole = async (title, salary, departmentId) => {
  validateString(title, 'Role title');
  validateNumber(salary, 'Salary');
  validateNumber(departmentId, 'Department ID');
  return executeQuery('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *;', [
    title,
    salary,
    departmentId,
  ]);
};

const updateRoleTitle = async (roleId, newTitle) => {
  validateNumber(roleId, 'Role ID');
  validateString(newTitle, 'New role title');
  return executeQuery('UPDATE role SET title = $1 WHERE id = $2 RETURNING *;', [newTitle, roleId]);
};

const deleteRole = async (roleId) => {
  validateNumber(roleId, 'Role ID');
  return executeQuery('DELETE FROM role WHERE id = $1 RETURNING *;', [roleId]);
};

// Employee Queries
const viewAllEmployees = async () =>
  executeQuery(`
    SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary,
           CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
  `);

const addEmployee = async (firstName, lastName, roleId, managerId) => {
  validateString(firstName, 'First name');
  validateString(lastName, 'Last name');
  validateNumber(roleId, 'Role ID');
  if (managerId !== null) validateNumber(managerId, 'Manager ID');
  return executeQuery(
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *;',
    [firstName, lastName, roleId, managerId]
  );
};

const updateEmployeeRole = async (employeeId, newRoleId) => {
  validateNumber(employeeId, 'Employee ID');
  validateNumber(newRoleId, 'New Role ID');
  return executeQuery('UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *;', [newRoleId, employeeId]);
};

const updateEmployeeManager = async (employeeId, newManagerId) => {
  validateNumber(employeeId, 'Employee ID');
  if (newManagerId !== null) validateNumber(newManagerId, 'Manager ID');
  return executeQuery('UPDATE employee SET manager_id = $1 WHERE id = $2 RETURNING *;', [newManagerId, employeeId]);
};

const deleteEmployee = async (employeeId) => {
  validateNumber(employeeId, 'Employee ID');
  return executeQuery('DELETE FROM employee WHERE id = $1 RETURNING *;', [employeeId]);
};

// Export all functions
module.exports = {
  viewAllDepartments,
  addDepartment,
  updateDepartmentName,
  deleteDepartment,
  viewAllRoles,
  addRole,
  updateRoleTitle,
  deleteRole,
  viewAllEmployees,
  addEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  deleteEmployee,
};
