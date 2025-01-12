import inquirer from 'inquirer';
import logo from 'asciiart-logo';
import Db from './db.js'; // Ensure this path is correct
import { Department } from './db.js'; // Ensure this path is correct

const db = new Db();

// Display logo and initialize the application
export function init() {
    console.log("Initializing application..."); // Optional initialization log
    const logoText = logo({ name: 'Employee DB' }).render(); // Display the logo
    console.log(logoText); // Print the logo to the console
    loadMainMenu(); // Call the function to load the main menu
}

// Main Menu
function loadMainMenu() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'mainChoice',
                message: 'Main Menu: Select a category:',
                choices: [
                    { name: 'Employee', value: 'EMPLOYEE' },
                    { name: 'Role', value: 'ROLE' },
                    { name: 'Department', value: 'DEPARTMENT' },
                    { name: 'Exit', value: 'EXIT' },
                ],
            },
        ])
        .then((answers) => {
            switch (answers.mainChoice) {
                case 'EMPLOYEE':
                    loadEmployeeMenu();
                    break;
                case 'ROLE':
                    loadRoleMenu();
                    break;
                case 'DEPARTMENT':
                    loadDepartmentMenu();
                    break;
                case 'EXIT':
                    console.log('Goodbye!');
                    process.exit(0);
            }
        });
}

// Employee Menu
function loadEmployeeMenu() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employeeChoice',
                message: 'Employee Menu: Select an action:',
                choices: [
                    { name: 'Add Employee', value: 'ADD_EMPLOYEE' },
                    { name: 'Edit Employee', value: 'EDIT_EMPLOYEE' },
                    { name: 'Delete Employee', value: 'DELETE_EMPLOYEE' },
                    { name: 'Update Employee Manager', value: 'UPDATE_EMPLOYEE_MANAGER' },
                    { name: 'View All Employees', value: 'VIEW_EMPLOYEES' },
                    { name: 'View All Managers', value: 'VIEW_MANAGERS' }, 
                    { name: 'View Employees by Manager', value: 'VIEW_BY_MANAGER' }, 
                    { name: 'View Employees by Department', value: 'VIEW_BY_DEPARTMENT' }, 
                    { name: 'Return to Main Menu', value: 'RETURN' },
                ],
            },
        ])
        .then(async (answers) => {
            switch (answers.employeeChoice) {
                case 'ADD_EMPLOYEE':
                    await addEmployeePrompt();
                    break;
                case 'EDIT_EMPLOYEE':
                    await editEmployeePrompt();
                    break;
                case 'DELETE_EMPLOYEE':
                    await deleteEmployeePrompt();
                    break;
                case 'UPDATE_EMPLOYEE_MANAGER':
                    await updateEmployeeManagerPrompt();
                    break;
                case 'VIEW_EMPLOYEES':
                    await viewAllEmployees();
                    break;
                case 'VIEW_MANAGERS':
                    await viewAllManagers();
                    break;
                case 'VIEW_BY_MANAGER': 
                    await viewEmployeesByManager();
                    break;
                case 'VIEW_BY_DEPARTMENT': 
                    await viewEmployeesByDepartment();
                    break;
                case 'RETURN':
                    loadMainMenu();
                    break;
            }
        });
}
    //Add employee prompt
    async function addEmployeePrompt() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the first name of the employee:',
                validate: (input) => input ? true : 'First name cannot be empty.',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the last name of the employee:',
                validate: (input) => input ? true : 'Last name cannot be empty.',
            },
            {
                type: 'input',
                name: 'roleId',
                message: 'Enter the role ID of the employee:',
                validate: (input) => !isNaN(parseInt(input)) ? true : 'Role ID must be a number.'
            },
            {
                type: 'input',
                name: 'managerId',
                message: 'Enter the manager ID of the employee (leave blank if none):',
            },
        ]);

        const managerId = answers.managerId ? parseInt(answers.managerId) : null; // Convert to null if blank

    // Confirmation step
    const confirm = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'isConfirmed',
            message: `Are you sure you want to add ${answers.firstName} ${answers.lastName} with Role ID: ${answers.roleId} and Manager ID: ${managerId}?`,
            default: true,
        },
    ]);

    if (confirm.isConfirmed) {
        try {
            const newEmployee = await db.addEmployee(answers.firstName, answers.lastName, parseInt(answers.roleId), managerId);
            console.log(`Employee ${newEmployee.first_name} ${newEmployee.last_name} added successfully.`);
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    } else {
        console.log('Employee addition canceled.');
    }
    
    loadEmployeeMenu();
}
    //Edit employee prompt
    async function editEmployeePrompt() {
        const employees = await db.viewAllEmployees();
        const employeeChoices = employees.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.employee_id
        }));

        const { employeeId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select an employee to edit:',
                choices: employeeChoices,
            },
        ]);

        const updates = await inquirer.prompt([
            {
                type: 'input',
                name: 'roleId',
                message: 'Enter the new role ID (leave blank to keep current):',
                validate: (input) => input === '' || !isNaN(parseInt(input)) ? true : 'Role ID must be a number.'
            },
        ]);

        // Confirmation step
        const confirmUpdate = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'isConfirmed',
                message: `Are you sure you want to update the role for employee ID ${employeeId} to Role ID: ${updates.roleId}?`,
                default: true,
            },
        ]);

        if (!confirmUpdate.isConfirmed) {
            console.log('Employee update canceled.');
            loadEmployeeMenu();
            return;
        }

        try {
            if (updates.roleId) {
                await db.updateEmployee(employeeId, parseInt(updates.roleId));
                console.log(`Employee role updated successfully.`);
            } else {
                console.log('No changes made to employee role.');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        }
        loadEmployeeMenu();
    }

    // Delete Employee Function
    async function deleteEmployeePrompt() {
        const employees = await db.viewAllEmployees();
        const employeeChoices = employees.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.employee_id
        }));
    
        const { employeeId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select an employee to delete:',
                choices: employeeChoices,
            },
        ]);
    
        // Find the employee object based on the selected employeeId
        const employeeToDelete = employeeChoices.find(emp => emp.value === employeeId);
    
        // Confirmation step
        if (employeeToDelete) {
            const confirmDelete = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'isConfirmed',
                    message: `Are you sure you want to delete the employee ${employeeToDelete.name}?`,
                    default: false,
                },
            ]);
    
            if (!confirmDelete.isConfirmed) {
                console.log('Employee deletion canceled.');
                loadEmployeeMenu();
                return;
            }
    
            try {
                await db.deleteEmployee(employeeId);
                console.log(`Employee deleted successfully.`);
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        } else {
            console.error('Error: Employee not found.');
        }
    
        loadEmployeeMenu();
    }

    //Update employee manager
    async function updateEmployeeManagerPrompt() {
        try {
            // Fetch all employees
            const employees = await db.viewAllEmployees();
    
            // Map employees to prompt choices
            const employeeChoices = employees.map(emp => ({
                name: `${emp.first_name} ${emp.last_name}`,
                value: emp.employee_id,
            }));
    
            // Select the employee whose manager will be updated
            const { employeeId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Select the employee to update their manager:',
                    choices: employeeChoices,
                },
            ]);
    
            // Fetch all managers
            const managers = await db.viewAllManagers();
    
            // Check if there are managers available
            if (managers.length === 0) {
                console.log("No managers available to assign.");
                return loadEmployeeMenu(); // Exit early if no managers
            }
    
            // Map managers to prompt choices
            const managerChoices = managers
                .filter(manager => manager.manager_id !== employeeId) 
                .map(manager => ({
                    name: `${manager.first_name} ${manager.last_name}`,
                    value: manager.manager_id,
                }));
    
            // Include an option to unassign the manager with a specific value
            managerChoices.unshift({ name: 'No Manager Assigned', value: -1 }); 
    
            let validSelection = false;
            while (!validSelection) {
                // Prompt the user to select a new manager
                const { managerId } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'managerId',
                        message: 'Select the new manager (or "No Manager Assigned" to unassign):',
                        choices: managerChoices,
                    },
                ]);
    
                // Check if the selected manager is the same as the employee
                if (managerId === employeeId) {
                    console.log("An employee cannot be their own manager. Please select a different manager.");
                    continue; 
                }
    
                // Confirmation step
                const confirmUpdate = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'isConfirmed',
                        message: `Are you sure you want to update the manager for employee ID ${employeeId} to Manager ID: ${managerId === -1 ? 'None' : managerId}?`,
                        default: true,
                    },
                ]);
    
                if (!confirmUpdate.isConfirmed) {
                    console.log('Employee manager update canceled.');
                    return loadEmployeeMenu();
                }
    
                // Update the manager in the database
                await db.updateEmployeeManager(employeeId, managerId === -1 ? null : managerId); 
                console.log('Employee manager updated successfully!');
                validSelection = true; 
            }
        } catch (error) {
            console.error("Error updating employee manager:", error);
        } finally {
            loadEmployeeMenu(); 
        }
    }
    
    // View All Employees 
    async function viewAllEmployees() {
        try {
            console.log('Loading employees, please wait...');
            const employees = await db.viewAllEmployees(); 
            console.table(employees); 
        } catch (error) {
            console.error('Error retrieving employees:', error);
        } finally {
            loadEmployeeMenu(); 
        }
    }

    async function viewEmployeesByManager() {
        try {
            console.log('Loading employees by manager, please wait...');
            const employees = await db.viewEmployeesByManager(); 
            if (employees.length > 0) {
                console.table(employees); 
            } else {
                console.log('No employees found.');
            }
        } catch (error) {
            console.error('Error viewing employees by manager:', error);
        } finally {
            loadEmployeeMenu(); // Return to the Employee Menu
        }
    }
    
    async function viewEmployeesByDepartment() {
        try {
            console.log('Loading employees by department, please wait...');
            const employees = await db.viewEmployeesByDepartment(); 
            if (employees.length > 0) {
                console.table(employees);
            } else {
                console.log('No employees found.');
            }
        } catch (error) {
            console.error('Error viewing employees by department:', error);
        } finally {
            loadEmployeeMenu(); 
        }
    }
    

    // View All Managers
    async function viewAllManagers() {
        try {
            console.log('Loading managers, please wait...');
            const managers = await db.viewAllManagers(); 
            if (managers.length > 0) {
                console.table(managers);
            } else {
                console.log('No managers found.');
            }
        } catch (error) {
            console.error('Error viewing managers:', error);
        } finally {
            loadEmployeeMenu(); 
        }
    }
    
//Role Menu
function loadRoleMenu() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'roleChoice',
                message: 'Role Menu: Select an action:',
                choices: [
                    { name: 'Add Role', value: 'ADD_ROLE' },
                    { name: 'Edit Role', value: 'EDIT_ROLE' },
                    { name: 'Delete Role', value: 'DELETE_ROLE' },
                    { name: 'View All Roles', value: 'VIEW_ROLES' },
                    { name: 'Return to Main Menu', value: 'RETURN' },
                ],
            },
        ])
        .then(async (answers) => {
            try {
                switch (answers.roleChoice) {
                    case 'ADD_ROLE':
                        await addRolePrompt();
                        break;
                    case 'EDIT_ROLE':
                        await editRolePrompt();
                        break;
                    case 'DELETE_ROLE':
                        await deleteRolePrompt();
                        break;
                    case 'VIEW_ROLES':
                        await viewAllRoles();
                        break;
                    case 'RETURN':
                        loadMainMenu();
                        break;
                }
            } catch (error) {
                console.error('Error loading role menu:', error);
                loadRoleMenu(); 
            }
        });
}

    // Add Role
    async function addRolePrompt() {
        console.log('Loading departments, please wait...');
        const departments = await db.viewAllDepartments();
        const departmentChoices = departments.map((dept: Department) => ({
            name: dept.department_name,
            value: dept.department_id,
        }));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the role:',
                validate: (input) => input ? true : 'Role title cannot be empty.',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for this role:',
                validate: (input) => {
                    const parsedSalary = parseFloat(input);
                    return !isNaN(parsedSalary) && parsedSalary > 0 ? true : 'Please enter a valid salary.';
                },
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department for this role:',
                choices: departmentChoices,
            },
        ]);

        // Confirmation step
        const confirmAdd = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'isConfirmed',
                message: `Are you sure you want to add the role "${answers.title}" with a salary of ${answers.salary} to department ID ${answers.departmentId}?`,
                default: true,
            },
        ]);

        if (!confirmAdd.isConfirmed) {
            console.log('Role addition canceled.');
            return loadRoleMenu();
        }

        try {
            const salary = parseFloat(answers.salary);
            await db.addRole(answers.title, salary, answers.departmentId);
            console.log(`Role "${answers.title}" added successfully.`);
        } catch (error) {
            console.error('Error adding role:', error);
        }
        loadRoleMenu();
    }

    // Edit Role
    async function editRolePrompt() {
        console.log('Loading roles, please wait...');
        const roles = await db.viewAllRoles();
        const roleChoices = roles.map((role: any) => ({
            name: role.title,
            value: role.id,
        }));

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the role to edit:',
                choices: roleChoices,
            },
            {
                type: 'input',
                name: 'newTitle',
                message: 'Enter the new title for the role (leave blank to keep current):',
            },
            {
                type: 'input',
                name: 'newSalary',
                message: 'Enter the new salary for the role (leave blank to keep current):',
                validate: (input) => input === '' || !isNaN(parseFloat(input)) ? true : 'Salary must be a number.'
            },
        ]);

        try {
            const updates: any = {};
            if (answers.newTitle) updates.title = answers.newTitle;
            if (answers.newSalary) updates.salary = parseFloat(answers.newSalary);

            if (Object.keys(updates).length > 0) {
                await db.updateRole(answers.roleId, updates);
                console.log('Role updated successfully.');
            } else {
                console.log('No changes made to the role.');
            }
        } catch (error) {
            console.error('Error editing role:', error);
        }
        loadRoleMenu();
    }

    // Delete Role
    async function deleteRolePrompt() {
        console.log('Loading roles, please wait...');
        const roles = await db.viewAllRoles();
        const roleChoices = roles.map((role: any) => ({
            name: role.title,
            value: role.id,
        }));

        const { roleId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the role to delete:',
                choices: roleChoices,
            },
        ]);

        // Confirmation step
        const confirmDelete = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'isConfirmed',
                message: `Are you sure you want to delete the role "${roleChoices.find(role => role.value === roleId)?.name}"?`,
                default: false,
            },
        ]);

        if (!confirmDelete.isConfirmed) {
            console.log('Role deletion canceled.');
            return loadRoleMenu();
        }

        try {
            await db.deleteRole(roleId);
            console.log('Role deleted successfully.');
        } catch (error) {
            console.error('Error deleting role:', error);
        }
        loadRoleMenu();
    }

    // View All Roles
    async function viewAllRoles() {
        try {
            console.log('Loading roles, please wait...');
            const roles = await db.viewAllRoles();
            if (roles.length > 0) {
                console.table(roles);
            } else {
                console.log('No roles found.');
            }
        } catch (error) {
            console.error('Error viewing roles:', error);
        }
        loadRoleMenu();
    }

    // Department Menu
    function loadDepartmentMenu() {
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'departmentChoice',
                    message: 'Department Menu: Select an action:',
                    choices: [
                        { name: 'Add Department', value: 'ADD_DEPARTMENT' },
                        { name: 'Edit Department', value: 'EDIT_DEPARTMENT' },
                        { name: 'Delete Department', value: 'DELETE_DEPARTMENT' },
                        { name: 'View All Departments', value: 'VIEW_DEPARTMENTS' },
                        { name: 'View Department Budget', value: 'VIEW_BUDGET' }, 
                        { name: 'Return to Main Menu', value: 'RETURN' },
                    ],
                },
            ])
            .then(async (answers) => {
                try {
                    switch (answers.departmentChoice) {
                        case 'ADD_DEPARTMENT':
                            await addDepartmentPrompt();
                            break;
                        case 'EDIT_DEPARTMENT':
                            await editDepartmentPrompt();
                            break;
                        case 'DELETE_DEPARTMENT':
                            await deleteDepartmentPrompt();
                            break;
                        case 'VIEW_DEPARTMENTS':
                            await viewAllDepartments();
                            break;
                        case 'VIEW_BUDGET': 
                            await viewDepartmentBudget();
                            break;
                        case 'RETURN':
                            loadMainMenu();
                            break;
                    }
                } catch (error) {
                    console.error('Error loading department menu:', error);
                    loadDepartmentMenu(); // Return to menu on error
                }
            });
    }
    
    //Add Department
    async function addDepartmentPrompt() {
        const { name } = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of the department:',
                validate: (input) => input ? true : 'Department name cannot be empty.', // Validate name
            },
        ]);

        try {
            await db.addDepartment(name);
            console.log(`Department "${name}" added successfully.`);
        } catch (error) {
            console.error('Error adding department:', error);
        }
        loadDepartmentMenu();
    }

    //Edit Department
    async function editDepartmentPrompt() {
        try {
            const departments = await db.viewAllDepartments();
            const departmentChoices = departments.map(dept => ({
                name: dept.department_name,
                value: dept.department_id,
            }));
    
            const { departmentId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select a department to edit:',
                    choices: departmentChoices,
                },
            ]);
    
            const { newDepartmentName } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'newDepartmentName',
                    message: 'Enter a new name for the department:',
                    validate: input => input.trim() !== '' || 'Name cannot be empty.',
                },
            ]);
    
            await db.editDepartment(departmentId, newDepartmentName);
            console.log('Department updated successfully.');
        } catch (error) {
            console.error('Error editing department:', error);
        }    
        loadDepartmentMenu(); 
    }


    // Delete Department Function
    async function deleteDepartmentPrompt() {
        try {
            const departments = await db.viewAllDepartments();
            const departmentChoices = departments.map(dept => ({
                name: dept.department_name,
                value: dept.department_id,
            }));
    
            const { departmentId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select a department to delete:',
                    choices: departmentChoices,
                },
            ]);
    
            await db.deleteDepartment(departmentId);
            console.log('Department deleted successfully.');
        } catch (error) {
            console.error('Error deleting department:', error);
        }
        loadDepartmentMenu(); // Load the department menu again
    }

    // View All Departments
async function viewAllDepartments() {
    try {
        console.log('Loading departments, please wait...');
        const departments = await db.viewAllDepartments(); // Fetch all departments
        console.table(departments); // Log the raw department data

        // Transform for prompt choices
        const departmentChoices = departments.map(dept => ({
            name: dept.department_name,
            value: dept.department_id,
        }));

        // Conditional logging based on environment
        if (process.env.NODE_ENV === 'development') {
            console.log(departmentChoices); // Log the transformed choices if in development
        }

        return departmentChoices; // Return choices if needed for further processing
    } catch (error) {
        console.error('Error viewing departments:', error);
    }
    loadDepartmentMenu(); // Ensure this function is clear in its purpose
}

    async function viewDepartmentBudget() {
        try {
            console.log('Loading department budgets, please wait...');
            const budgets = await db.viewDepartmentBudget(); // Call the database method
            if (budgets.length > 0) {
                console.table(budgets); // Display the budget data in a table
            } else {
                console.log('No departments found or no budgets to display.');
            }
        } catch (error) {
            console.error('Error viewing department budgets:', error);
        } finally {
            loadDepartmentMenu(); // Return to the Department Menu
        }
    }
    
// Initialize the application
init();
