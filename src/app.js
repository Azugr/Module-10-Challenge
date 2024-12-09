const inquirer = require('inquirer');
const { Client } = require('pg');
const dbQueries = require('./dbQueries');

// PostgreSQL client setup
const client = new Client({
  connectionString: 'postgresql://username:password@localhost:5432/employee_db',
});

// Connect to the database
client
  .connect()
  .then(() => console.log('Connected to the database.'))
  .catch((err) => console.error('Connection error', err.stack));

// Main menu logic
const mainMenu = async () => {
  try {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View All Departments',
          'View All Roles',
          'View All Employees',
          'Add a Department',
          'Add a Role',
          'Add an Employee',
          'Update an Employee Role',
          'Exit',
        ],
      },
    ]);

    switch (action) {
      case 'View All Departments':
        await dbQueries.viewAllDepartments(client);
        break;
      case 'View All Roles':
        await dbQueries.viewAllRoles(client);
        break;
      case 'View All Employees':
        await dbQueries.viewAllEmployees(client);
        break;
      case 'Add a Department':
        await dbQueries.addDepartment(client);
        break;
      case 'Add a Role':
        await dbQueries.addRole(client);
        break;
      case 'Add an Employee':
        await dbQueries.addEmployee(client);
        break;
      case 'Update an Employee Role':
        await dbQueries.updateEmployeeRole(client);
        break;
      case 'Exit':
        console.log('Goodbye!');
        client.end();
        return; // Exit the application
    }

    await mainMenu(); // Loop back to the main menu
  } catch (err) {
    console.error('An error occurred:', err);
  }
};

// Start the application
mainMenu();
