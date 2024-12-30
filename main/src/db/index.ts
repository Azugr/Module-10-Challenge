import inquirer from 'inquirer';
import logo from 'asciiart-logo';
import Db from '../db/server'; 


const db = new Db();

// Display logo
function init() {
    const logoText = logo({ name: 'Employee DB' }).render();
    console.log(logoText);
    loadMainPrompts();
}

// Load main prompts
function loadMainPrompts() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                { name: 'View All Employees', value: 'VIEW_EMPLOYEES' },
                { name: 'View All Employees By Department', value: 'VIEW_EMPLOYEES_BY_DEPARTMENT' },
                { name: 'View All Roles', value: 'VIEW_ROLES' },
                { name: 'Add Employee', value: 'ADD_EMPLOYEE' },
                { name: 'Remove Employee', value: 'REMOVE_EMPLOYEE' },
                { name: 'Update Employee Role', value: 'UPDATE_EMPLOYEE_ROLE' },
                { name: 'Update Employee Manager', value: 'UPDATE_EMPLOYEE_MANAGER' },
                { name: 'Exit', value: 'EXIT' },
            ],
        },
    ]).then((answers) => {
        handleUserChoice(answers.choice);
    }).catch((error) => {
        console.error('Error loading prompts:', error.message);
    });
}

// Handle user choice
async function handleUserChoice(choice: string) {
    switch (choice) {
        case 'VIEW_EMPLOYEES':
            try {
                const employees = await db.viewAllEmployees();
                console.table(employees);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching employees:', error.message);
                }
            }
            loadMainPrompts();
            break;

        case 'VIEW_EMPLOYEES_BY_DEPARTMENT':
            try {
                const departments = await db.viewAllDepartments();
                const departmentChoices = departments.map(department => ({
                    name: department.name,
                    value: department.id
                }));

                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'departmentId',
                        message: 'Select a department:',
                        choices: departmentChoices
                    }
                ]);

                const employeesByDepartment = await db.viewEmployeesByDepartment(answers.departmentId);
                console.table(employeesByDepartment);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching employees by department:', error.message);
                }
            }
            loadMainPrompts();
            break;

        case 'VIEW_ROLES':
            try {
                const roles = await db.viewAllRoles(); // Ensure this method is defined in your Db class
                console.table(roles);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching roles:', error.message);
                }
            }
            loadMainPrompts();
            break;

        case 'ADD_EMPLOYEE':
            await addEmployeePrompt(); // Ensure this function is defined
            break;

        case 'REMOVE_EMPLOYEE':
            await removeEmployeePrompt(); // Ensure this function is defined
            break;

        case 'UPDATE_EMPLOYEE_ROLE':
            await updateEmployeeRolePrompt(); // Ensure this function is defined
            break;

        case 'EXIT':
            console.log('Goodbye!');
            process.exit(0);

        default:
            console.log('Invalid option!');
            loadMainPrompts();
    }
}

// Define the addEmployeePrompt function
async function addEmployeePrompt() {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the first name of the employee:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the last name of the employee:',
            },
            {
                type: 'input',
                name: 'roleId',
                message: 'Enter the role ID of the employee:',
            },
            {
                type: 'input',
                name: 'managerId',
                message: 'Enter the manager ID of the employee (or leave blank if none):',
            },
        ]);

        const { firstName, lastName, roleId, managerId } = answers;
        const employee = await db.addEmployee(firstName, lastName, roleId, managerId ? parseInt(managerId) : null);
        console.log(`Added employee: ${employee.first_name} ${employee.last_name}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error adding employee:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    } finally {
        loadMainPrompts(); // Ensure this is called to return to the main prompts
    }
}
   
async function removeEmployeePrompt() {
    try {
        // Fetch all employees from the database
        const employees = await db.viewAllEmployees();
        
        if (employees.length === 0) {
            console.log('No employees available to remove.');
            return loadMainPrompts();
        }

        // Map employees to choices for Inquirer
        const employeeChoices = employees.map((employee: any) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));

        // Prompt the user to select an employee to remove
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to remove:',
                choices: employeeChoices,
            },
        ]);

        const { employeeId } = answer;

        // Call the DB method to remove the employee
        await db.deleteEmployee(employeeId);
        console.log('Employee removed successfully.');
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    } finally {
        loadMainPrompts();
    }
}

async function updateEmployeeRolePrompt() {
    try {
        // Fetch all employees from the database
        const employees = await db.viewAllEmployees();
        
        if (employees.length === 0) {
            console.log('No employees available to update.');
            return loadMainPrompts();
        }

        // Map employees to choices for Inquirer
        const employeeChoices = employees.map((employee: any) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));

        // Fetch all roles from the database
        const roles = await db.viewAllRoles();
        
        if (roles.length === 0) {
            console.log('No roles available to assign.');
            return loadMainPrompts();
        }

        // Map roles to choices for Inquirer
        const roleChoices = roles.map((role: any) => ({
            name: role.title,
            value: role.id,
        }));

        // Prompt the user to select an employee and a new role
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to update:',
                choices: employeeChoices,
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the new role for the employee:',
                choices: roleChoices,
            },
        ]);

        const { employeeId, roleId } = answers;

        // Call the DB method to update the employee's role
        await db.updateEmployeeRole(employeeId, roleId);
        console.log('Employee role updated successfully.');

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred');
        }
    } finally {
        loadMainPrompts();
    }
}

// Call the init function to start the application
init();
