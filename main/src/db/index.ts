import inquirer from 'inquirer';
import logo from 'asciiart-logo';
import Db from '../db/server';
import { Department } from '../db/server';

const db = new Db();

// Define the ManagerChoice type
type ManagerChoice = {
    name: string;
    value: number | null; 
};

// Display logo
function init() {
    const logoText = logo({ name: 'Employee DB' }).render();
    console.log(logoText);
    loadMainMenu();
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
                    { name: 'View All Managers', value: 'VIEW_MANAGERS' }, // New option
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
                case 'RETURN':
                    loadMainMenu();
                    break;
            }
        });
}

    // Add Employee Function
    async function addEmployeePrompt() {
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
                message: 'Enter the manager ID of the employee (leave blank if none):',
            },
        ]);

        const managerId = answers.managerId ? parseInt(answers.managerId) : null; // Convert to null if blank

        try {
            const newEmployee = await db.addEmployee(answers.firstName, answers.lastName, parseInt(answers.roleId), managerId);
            console.log(`Employee ${newEmployee.first_name} ${newEmployee.last_name} added successfully.`);
        } catch (error) {
            console.error('Error adding employee:', error);
        }
        loadEmployeeMenu();
    }

    // Edit Employee Function
    async function editEmployeePrompt() {
        const employees = await db.viewAllEmployees(); // Use the correct method to get all employees
        const employeeChoices = employees.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.employee_id // Use employee_id from the query
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
            },
        ]);

        try {
            if (updates.roleId) {
                await db.updateEmployee(employeeId, parseInt(updates.roleId)); // Only update role_id
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
            value: emp.employee_id // Use employee_id from the query
        }));

        const { employeeId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select an employee to delete:',
                choices: employeeChoices,
            },
        ]);

        try {
            await db.deleteEmployee(employeeId);
            console.log(`Employee deleted successfully.`);
        } catch (error) {
            console.error('Error deleting employee:', error);
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
                .filter(manager => manager.manager_id !== employeeId) // Prevent self-assignment
                .map(manager => ({
                    name: `${manager.first_name} ${manager.last_name}`,
                    value: manager.manager_id,
                }));
    
            // Include an option to unassign the manager
            managerChoices.unshift({ name: 'None', value: null });
    
            let validSelection = false;
            while (!validSelection) {
                // Prompt the user to select a new manager
                const { managerId } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'managerId',
                        message: 'Select the new manager (or "None" to unassign):',
                        choices: managerChoices,
                    },
                ]);
    
                // Check if the selected manager is the same as the employee
                if (managerId === employeeId) {
                    console.log("An employee cannot be their own manager. Please select a different manager.");
                    continue; // Re-prompt for a valid selection
                }
                // Update the manager in the database
                await db.updateEmployeeManager(employeeId, managerId);
                console.log('Employee manager updated successfully!');
                validSelection = true; // Set validSelection to true to exit the loop
            }
        } catch (error) {
            console.error("Error updating employee manager:", error);
        } finally {
            loadEmployeeMenu(); // Always return to the employee menu
        }
    }
    
    // View All Employees 
    async function viewAllEmployees() {
        try {
            const employees = await db.viewAllEmployees(); 
            console.table(employees); 
        } catch (error) {
            console.error('Error retrieving employees:', error);
        }
        loadEmployeeMenu();
    }

    //View All Managers
    async function viewAllManagers() {
        try {
            const managers = await db.viewAllManagers(); 
            if (managers.length > 0) {
                console.table(managers);
            } else {
                console.log('No managers found.');
            }
        } catch (error) {
            console.error('Error viewing managers:', error);
        }
        loadEmployeeMenu();
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
        const departments = await db.viewAllDepartments();
        const departmentChoices = departments.map((dept: Department) => ({
            name: dept.name,
            value: dept.id,
        }));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the role:',
                validate: (input) => input ? true : 'Role title cannot be empty.', // Validate title
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for this role:',
                validate: (input) => {
                    const parsedSalary = parseFloat(input);
                    return !isNaN(parsedSalary) && parsedSalary > 0 ? true : 'Please enter a valid salary.';
                }, // Validate salary
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department for this role:',
                choices: departmentChoices,
            },
        ]);

        try {
            const salary = parseFloat(answers.salary);
            await db.addRole(answers.title, salary, answers.departmentId);
            console.log(`Role "${answers.title}" added successfully.`);
        } catch (error) {
            console.error('Error adding role:', error);
        }
        loadRoleMenu();
    }

    //Edit role
    async function editRolePrompt() {
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

    //Delete role
    async function deleteRolePrompt() {
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

        try {
            await db.deleteRole(roleId);
            console.log('Role deleted successfully.');
        } catch (error) {
            console.error('Error deleting role:', error);
        }
        loadRoleMenu();
    }

    //View all roles
    async function viewAllRoles() {
        try {
            const roles = await db.viewAllRoles();
            console.table(roles);
        } catch (error) {
            console.error('Error viewing roles:', error);
        }
        loadRoleMenu();
    }

//Department Menu
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
        const departments = await db.viewAllDepartments();
        const departmentChoices = departments.map((dept: any) => ({
            name: dept.name,
            value: dept.id,
        }));
    
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department to edit:',
                choices: departmentChoices,
            },
            {
                type: 'input',
                name: 'newName',
                message: 'Enter the new name for the department (leave blank to keep current):',
            },
        ]);
    
        try {
            if (answers.newName) {
                await db.updateDepartment(answers.departmentId, answers.newName);
                console.log('Department updated successfully.');
            } else {
                console.log('No changes made to the department.');
            }
        } catch (error) {
            console.error('Error editing department:', error);
        }
        loadDepartmentMenu();
    }

    //Delete department
    async function deleteDepartmentPrompt() {
        const departments = await db.viewAllDepartments();
        const departmentChoices = departments.map((dept: any) => ({
            name: dept.name,
            value: dept.id,
        }));
    
        const { departmentId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department to delete:',
                choices: departmentChoices,
            },
        ]);
    
        try {
            await db.deleteDepartment(departmentId);
            console.log('Department deleted successfully.');
        } catch (error) {
            console.error('Error deleting department:', error);
        }
        loadDepartmentMenu();
    }

    //View all departments
    async function viewAllDepartments() {
        try {
            const departments = await db.viewAllDepartments();
            console.table(departments);
        } catch (error) {
            console.error('Error viewing departments:', error);
        }
        loadDepartmentMenu();
    }
    
// Initialize the application
init();
