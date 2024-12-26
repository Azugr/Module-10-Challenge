import inquirer from 'inquirer';
import express from 'express';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Query Function
const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error: any) {
    if (error.code) {
      console.error(`Database error [${error.code}]: ${error.message}`);
    } else {
      console.error('Database error:', error.message);
    }
    throw error;
  }
};

// Helper to Format Choices
const formatChoices = (items: any[], nameField = 'name', valueField = 'id') =>
  items.map((item) => ({
    name: item[nameField],
    value: item[valueField],
  }));

// Graceful Shutdown
const shutdown = async () => {
  try {
    await pool.end();
    console.log('Database connection pool closed.');
    process.exit(0);
  } catch (error: any) {
    console.error('Error closing database connection:', error.message);
    process.exit(1);
  }
};

// Error Handling Helper
const handleError = async (error: Error, actionDescription: string): Promise<boolean> => {
  console.error(`Error while ${actionDescription}: ${error.message}`);
  const { retry } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'retry',
      message: 'An error occurred. Would you like to retry?',
      default: false,
    },
  ]);
  return retry;
};

// Main Menu
const mainMenu = async () => {
  while (true) {
    try {
      const { category } = await inquirer.prompt([
        {
          type: 'list',
          name: 'category',
          message: 'What would you like to manage?',
          choices: [
            'Departments',
            'Roles',
            'Employees',
            'View employees by manager',
            'View employees by department',
            'View department budget',
            'Exit',
          ],
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
        case 'View employees by manager':
          await viewEmployeesByManager();
          break;
        case 'View employees by department':
          await viewEmployeesByDepartment();
          break;
        case 'View department budget':
          await viewDepartmentBudget();
          break;
        case 'Exit':
          console.log('Goodbye!');
          await shutdown();
          return;
      }
    } catch (error: any) {
      const retry = await handleError(error, 'navigating the main menu');
      if (!retry) return;
    }
  }
};

// Department Menu
const departmentMenu = async () => {
  while (true) {
    try {
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
          if (departments.length === 0) {
            console.log('No departments available to update.');
            break;
          }
          const departmentChoices = formatChoices(departments);
          const { departmentId, newName } = await inquirer.prompt([
            { type: 'list', name: 'departmentId', message: 'Select the department to update:', choices: departmentChoices },
            { type: 'input', name: 'newName', message: 'Enter the new department name:' },
          ]);
          await db.updateDepartmentName(departmentId, newName);
          console.log(`Updated department name to: ${newName}`);
          break;

        case 'Delete':
          const departmentsToDelete = await db.viewAllDepartments();
          if (departmentsToDelete.length === 0) {
            console.log('No departments available to delete.');
            break;
          }
          const deleteChoices = formatChoices(departmentsToDelete);
          const { departmentIdToDelete } = await inquirer.prompt([
            { type: 'list', name: 'departmentIdToDelete', message: 'Select the department to delete:', choices: deleteChoices },
          ]);
          await db.deleteDepartment(departmentIdToDelete);
          console.log(`Deleted department with ID: ${departmentIdToDelete}`);
          break;

        case 'View All':
          const allDepartments = await db.viewAllDepartments();
          if (allDepartments.length > 0) {
            console.table(allDepartments);
          } else {
            console.log('No departments found.');
          }
          break;

        case 'Back to Main Menu':
          return;
      }
    } catch (error: any) {
      const retry = await handleError(error, 'managing departments');
      if (!retry) return;
    }
  }
};

// Role Menu
const roleMenu = async () => {
  while (true) {
    try {
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
          const departmentChoices = formatChoices(departments);
          const { title, salary, departmentId } = await inquirer.prompt([
            { type: 'input', name: 'title', message: 'Enter role title:' },
            { type: 'input', name: 'salary', message: 'Enter role salary:' },
            {
              type: 'list',
              name: 'departmentId',
              message: 'Select department:',
              choices: departmentChoices,
            },
          ]);
          await db.addRole(title, salary, departmentId);
          console.log(`Added role: ${title}`);
          break;

        case 'Update':
          const roles = await db.viewAllRoles();
          if (roles.length === 0) {
            console.log('No roles available to update.');
            break;
          }
          const roleChoices = formatChoices(roles, 'title');
          const { roleId, newTitle } = await inquirer.prompt([
            { type: 'list', name: 'roleId', message: 'Select the role to update:', choices: roleChoices },
            { type: 'input', name: 'newTitle', message: 'Enter the new role title:' },
          ]);
          await db.updateRoleTitle(roleId, newTitle);
          console.log(`Updated role title to: ${newTitle}`);
          break;

        case 'Delete':
          const rolesToDelete = await db.viewAllRoles();
          const deleteRoleChoices = formatChoices(rolesToDelete, 'title');
          const { roleIdToDelete } = await inquirer.prompt([
            { type: 'list', name: 'roleIdToDelete', message: 'Select the role to delete:', choices: deleteRoleChoices },
          ]);
          await db.deleteRole(roleIdToDelete);
          console.log('Deleted role.');
          break;

        case 'View All':
          const allRoles = await db.viewAllRoles();
          console.table(allRoles);
          break;

        case 'Back to Main Menu':
          return;
      }
    } catch (error: any) {
      const retry = await handleError(error, 'managing roles');
      if (!retry) return;
    }
  }
};

// View Employees by Manager
const viewEmployeesByManager = async () => {
  while (true) {
    try {
      const query = `
        SELECT 
          e.id AS employee_id,
          e.first_name AS employee_first_name,
          e.last_name AS employee_last_name,
          m.id AS manager_id,
          CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM 
          employee e
        LEFT JOIN 
          employee m
        ON 
          e.manager_id = m.id
        ORDER BY 
          manager_name;
      `;
      const rows = await executeQuery(query);
      if (rows.length === 0) {
        console.log('No employees found with managers.');
      } else {
        console.table(rows);
      }
      const { continueViewing } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueViewing',
          message: 'Would you like to view employees by manager again?',
          default: false,
        },
      ]);
      if (!continueViewing) return;
    } catch (error: any) {
      const retry = await handleError(error, 'viewing employees by manager');
      if (!retry) return;
    }
  }
};

// Start the Application
(async () => {
  await mainMenu();
})();

  
  
  