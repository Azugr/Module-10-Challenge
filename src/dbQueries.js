const inquirer = require('inquirer');

// View all departments
const viewAllDepartments = async (client) => {
  try {
    const res = await client.query('SELECT * FROM department;');
    console.table(res.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
  }
};

// View all roles
const viewAllRoles = async (client) => {
  try {
    const res = await client.query(`
      SELECT role.id, role.title, role.salary, department.name AS department
      FROM role
      JOIN department ON role.department_id = department.id;
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error fetching roles:', err);
  }
};

// View all employees
const viewAllEmployees = async (client) => {
  try {
    const res = await client.query(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,
             COALESCE(manager.first_name || ' ' || manager.last_name, 'None') AS manager
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
      LEFT JOIN employee AS manager ON employee.manager_id = manager.id;
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
};

// Add a department
const addDepartment = async (client) => {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the new department:',
    },
  ]);

  try {
    await client.query('INSERT INTO department (name) VALUES ($1);', [name]);
    console.log(`Added department: ${name}`);
  } catch (err) {
    console.error('Error adding department:', err);
  }
};

// Add a role
const addRole = async (client) => {
  const departments = await client.query('SELECT * FROM department;');
  const departmentChoices = departments.rows.map((dept) => ({
    name: dept.name,
    value: dept.id,
  }));

  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the name of the new role:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the new role:',
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department for the new role:',
      choices: departmentChoices,
    },
  ]);

  try {
    await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);', [title, salary, department_id]);
    console.log(`Added role: ${title}`);
  } catch (err) {
    console.error('Error adding role:', err);
  }
};

// Add an employee
const addEmployee = async (client) => {
  const roles = await client.query('SELECT * FROM role;');
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const employees = await client.query('SELECT * FROM employee;');
  const managerChoices = employees.rows.map((emp) => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));
  managerChoices.unshift({ name: 'None', value: null });

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: "Enter the employee's first name:",
    },
    {
      type: 'input',
      name: 'last_name',
      message: "Enter the employee's last name:",
    },
    {
      type: 'list',
      name: 'role_id',
      message: "Select the employee's role:",
      choices: roleChoices,
    },
    {
      type: 'list',
      name: 'manager_id',
      message: "Select the employee's manager:",
      choices: managerChoices,
    },
  ]);

  try {
    await client.query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4);',
      [first_name, last_name, role_id, manager_id]
    );
    console.log(`Added employee: ${first_name} ${last_name}`);
  } catch (err) {
    console.error('Error adding employee:', err);
  }
};

// Update an employee's role
const updateEmployeeRole = async (client) => {
  const employees = await client.query('SELECT * FROM employee;');
  const employeeChoices = employees.rows.map((emp) => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const roles = await client.query('SELECT * FROM role;');
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select the employee to update:',
      choices: employeeChoices,
    },
    {
      type: 'list',
      name: 'role_id',
      message: "Select the employee's new role:",
      choices: roleChoices,
    },
  ]);

  try {
    await client.query('UPDATE employee SET role_id = $1 WHERE id = $2;', [role_id, employee_id]);
    console.log('Updated employee role.');
  } catch (err) {
    console.error('Error updating employee role:', err);
  }
};

module.exports = {
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole,
};
