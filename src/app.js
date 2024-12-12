require('dotenv').config();
const inquirer = require('inquirer');
const { Pool } = require('pg');
const db = require('./dbQueries'); 

// Use Pool for efficient database connection handling
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'employee_db', 
  password: 'lucas920',
  port: 5432,
});

// Query Function
const executeQuery = async (query, params = []) => {
  try {
    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    console.error('Database error:', error.message);
    throw error;
  }
};

// Main Menu
const mainMenu = async () => {
  try {
    const { category } = await inquirer.prompt([
      {
        type: 'list',
        name: 'category',
        message: 'What would you like to manage?',
        choices: ['Departments', 'Roles', 'Employees', 'Exit'],
      },
    ]);

    switch (category) {
      case 'Departments':
        await departmentMenu();
        break;
      case 'Roles':
        await roleMenu();
        break;
      case 'Employees':
        await employeeMenu();
        break;
      case 'Exit':
        console.log('Goodbye!');
        await pool.end();
        process.exit();
    }

    await mainMenu();
  } catch (error) {
    console.error('Error in main menu:', error.message);
  }
};



// Department Menu
const departmentMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do with Departments?',
      choices: ['Add', 'Update', 'Delete', 'View All', 'Back to Main Menu'],
    },
  ]);

  switch (action) {
    case 'Add':
      const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter department name:' },
      ]);
      await db.addDepartment(name);
      console.log(`Added department: ${name}`);
      break;

    case 'Update':
      const departments = await db.viewAllDepartments();
      const departmentChoices = departments.map((dept) => ({
        name: dept.name,
        value: dept.id,
      }));

      const { department_id, new_name } = await inquirer.prompt([
        { type: 'list', name: 'department_id', message: 'Select the department to update:', choices: departmentChoices },
        { type: 'input', name: 'new_name', message: 'Enter the new name for the department:' },
      ]);
      await db.updateDepartmentName(department_id, new_name);
      console.log(`Updated department name to: ${new_name}`);
      break;

    case 'Delete':
      const departmentsForDelete = await db.viewAllDepartments();
      const deleteChoices = departmentsForDelete.map((dept) => ({
        name: dept.name,
        value: dept.id,
      }));

      const { department_id_for_delete } = await inquirer.prompt([
        { type: 'list', name: 'department_id_for_delete', message: 'Select the department to delete:', choices: deleteChoices },
      ]);
      await db.deleteDepartment(department_id_for_delete);
      console.log('Deleted department.');
      break;

    case 'View All':
      console.table(await db.viewAllDepartments());
      break;

    case 'Back to Main Menu':
      return;
  }

  await departmentMenu();
};

// Role Menu
const roleMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do with Roles?',
      choices: ['Add', 'Update', 'Delete', 'View All', 'Back to Main Menu'],
    },
  ]);

  switch (action) {
    case 'Add':
      const departments = await db.viewAllDepartments();
      const departmentChoices = departments.map((dept) => ({
        name: dept.name,
        value: dept.id,
      }));

      const { title, salary, department_id } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter role title:' },
        { type: 'input', name: 'salary', message: 'Enter role salary:' },
        {
          type: 'list',
          name: 'department_id',
          message: 'Select department:',
          choices: departmentChoices,
        },
      ]);
      await db.addRole(title, salary, department_id);
      console.log(`Added role: ${title}`);
      break;

    case 'Update':
      const roles = await db.viewAllRoles();
      const roleChoices = roles.map((role) => ({ name: role.title, value: role.id }));

      const { role_id, new_title } = await inquirer.prompt([
        { type: 'list', name: 'role_id', message: 'Select the role to update:', choices: roleChoices },
        { type: 'input', name: 'new_title', message: 'Enter the new title for the role:' },
      ]);
      await db.updateRoleTitle(role_id, new_title);
      console.log(`Updated role title to: ${new_title}`);
      break;

    case 'Delete':
      const rolesForDelete = await db.viewAllRoles();
      const deleteRoleChoices = rolesForDelete.map((role) => ({ name: role.title, value: role.id }));

      const { role_id_for_delete } = await inquirer.prompt([
        { type: 'list', name: 'role_id_for_delete', message: 'Select the role to delete:', choices: deleteRoleChoices },
      ]);
      await db.deleteRole(role_id_for_delete);
      console.log('Deleted role.');
      break;

    case 'View All':
      console.table(await db.viewAllRoles());
      break;

    case 'Back to Main Menu':
      return;
  }

  await roleMenu();
};

// Employee Menu
const employeeMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do with Employees?',
      choices: ['Add', 'Update Role', 'Update Manager', 'Delete', 'View All', 'Back to Main Menu'],
    },
  ]);

  switch (action) {
    case 'Add':
      const roles = await db.viewAllRoles();
      const employees = await db.viewAllEmployees();

      const roleChoices = roles.map((role) => ({ name: role.title, value: role.id }));
      const managerChoices = employees.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      }));
      managerChoices.unshift({ name: 'None', value: null });

      const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        { type: 'input', name: 'first_name', message: "Enter employee's first name:" },
        { type: 'input', name: 'last_name', message: "Enter employee's last name:" },
        { type: 'list', name: 'role_id', message: "Select employee's role:", choices: roleChoices },
        { type: 'list', name: 'manager_id', message: "Select employee's manager:", choices: managerChoices },
      ]);

      await db.addEmployee(first_name, last_name, role_id, manager_id);
      console.log(`Added employee: ${first_name} ${last_name}`);
      break;

    case 'Update Role':
      const employeesForRoleUpdate = await db.viewAllEmployees();
      const rolesForUpdate = await db.viewAllRoles();

      const employeeChoices = employeesForRoleUpdate.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      }));
      const roleChoicesForUpdate = rolesForUpdate.map((role) => ({
        name: role.title,
        value: role.id,
      }));

      const { employee_id, new_role_id } = await inquirer.prompt([
        { type: 'list', name: 'employee_id', message: 'Select the employee to update:', choices: employeeChoices },
        { type: 'list', name: 'new_role_id', message: 'Select the new role:', choices: roleChoicesForUpdate },
      ]);

      await db.updateEmployeeRole(employee_id, new_role_id);
      console.log('Updated employee role.');
      break;

    case 'Update Manager':
      const employeesForManagerUpdate = await db.viewAllEmployees();

      const employeeChoicesForManager = employeesForManagerUpdate.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      }));
      const managerChoicesForUpdate = employeesForManagerUpdate.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      }));
      managerChoicesForUpdate.unshift({ name: 'None', value: null });

      const { employee_id_for_manager, new_manager_id } = await inquirer.prompt([
        { type: 'list', name: 'employee_id_for_manager', message: 'Select the employee to update:', choices: employeeChoicesForManager },
        { type: 'list', name: 'new_manager_id', message: 'Select the new manager:', choices: managerChoicesForUpdate },
      ]);

      await db.updateEmployeeManager(employee_id_for_manager, new_manager_id);
      console.log('Updated employee manager.');
      break;

    case 'Delete':
      const employeesForDelete = await db.viewAllEmployees();
      const deleteEmployeeChoices = employeesForDelete.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      }));

      const { employee_id_for_delete } = await inquirer.prompt([
        { type: 'list', name: 'employee_id_for_delete', message: 'Select the employee to delete:', choices: deleteEmployeeChoices },
      ]);

      await db.deleteEmployee(employee_id_for_delete);
      console.log('Deleted employee.');
      break;

    case 'View All':
      console.table(await db.viewAllEmployees());
      break;

    case 'Back to Main Menu':
      return;
  }

  await employeeMenu();
};

// Start the application
(async () => {
  try {
    await mainMenu();
  } catch (error) {
    console.error('Unexpected error:', error.message);
    await pool.end(); // Ensure connections are closed
    process.exit(1);
  }
})();

// Importing dbQueries methods
const {
  viewAllDepartments,
  addDepartment,
  deleteRecord,
  updateDepartmentName,
  viewEmployeesByDepartment,
  viewDepartmentBudget,
  viewEmployeesByManager,
  updateEmployeeManager,
  viewAllRoles,
  addRole,
  deleteRole,
  updateRoleTitle,
  addEmployee,
  deleteEmployee,
  updateEmployee,
  viewAllManagers,
  addManager,
  deleteManager,
  updateManager,
} = require('./dbQueries');


