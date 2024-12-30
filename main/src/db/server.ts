import { pool } from '../db/connection'; // Ensure this path is correct

export interface EmployeeData {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    department: string;
    salary: number;
    manager: string | null; 
}

export interface Department {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    title: string;
}

export default class Db {
    // View all employees
    async viewAllEmployees(): Promise<EmployeeData[]> {
        try {
            const query = `
                SELECT 
                    employee.id, 
                    employee.first_name, 
                    employee.last_name, 
                    role.title AS role, 
                    department.name AS department, 
                    role.salary, 
                    CONCAT(COALESCE(manager.first_name, 'No Manager'), ' ', COALESCE(manager.last_name, '')) AS manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee AS manager ON employee.manager_id = manager.id
                ORDER BY employee.id;
            `;
            const { rows } = await pool.query(query);

            // Map the rows to the EmployeeData interface
            return rows.map(row => ({
                id: row.id,
                first_name: row.first_name,
                last_name: row.last_name,
                role: row.role,
                department: row.department,
                salary: row.salary,
                manager: row.manager || null // Ensure manager is null if not available
            })) as EmployeeData[]; // Type assertion to EmployeeData[]
        } catch (error: any) {
            console.error('Error fetching employees:', error.message);
            throw error;
        }
    }

    // View all departments
    async viewAllDepartments(): Promise<Department[]> { // Specify the return type
        const query = `
            SELECT 
                id AS department_id,
                name AS department_name
            FROM 
                department
            ORDER BY 
                department_name;
        `;
        
        try {
            const { rows } = await pool.query(query);
            return rows; // Return the rows
        } catch (error: any) {
            console.error('Error fetching departments:', error.message);
            throw error;
        }
    }

    // View all roles
    async viewAllRoles(): Promise<Role[]> { // Specify the return type
        const query = `
            SELECT 
                id AS role_id,
                name AS role_title
            FROM 
                role
            ORDER BY 
                role_title;
        `;
        try {
            const { rows } = await pool.query(query);
            return rows; // Return the rows
        } catch (error: any) {
            console.error('Error fetching departments:', error.message);
            throw error;
        }
    }
    
    // Add an employee
    async addEmployee(firstName: string, lastName: string, roleId: number, managerId: number | null): Promise<EmployeeData> {
        try {
            const query = `
                INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                VALUES ($1, $2, $3, $4) RETURNING *;
            `;
            const { rows } = await pool.query(query, [firstName, lastName, roleId, managerId]);
            return rows[0]; // Ensure this matches EmployeeData structure
        } catch (error: any) {
            console.error('Error adding employee:', error.message);
            throw error;
        }
    }

     // Delete an employee
     async deleteEmployee(employeeId: number): Promise<void> {
        try {
            const query = 'DELETE FROM employee WHERE id = $1;';
            await pool.query(query, [employeeId]);
            console.log(`Employee with ID ${employeeId} has been deleted.`);
        } catch (error: any) {
            console.error('Error deleting employee:', error.message);
            throw error; // Rethrow the error for further handling
        }
    }

    // Update an employee's role
    async updateEmployeeRole(employeeId: number, roleId: number): Promise<void> {
        try {
            const query = 'UPDATE employee SET role_id = $1 WHERE id = $2;';
            await pool.query(query, [roleId, employeeId]);
        } catch (error: any) {
            console.error('Error updating employee role:', error.message);
            throw error;
        }
    }

    // View Employees by Department
    async viewEmployeesByDepartment(departmentId: number): Promise<EmployeeData[]> {
        const query = `
        SELECT 
            employee.id AS employee_id,
            employee.first_name AS employee_first_name,
            employee.last_name AS employee_last_name,
            department.id AS department_id,
            department.name AS department_name
        FROM 
            employee
        JOIN 
            role ON employee.role_id = role.id
        JOIN 
            department ON role.department_id = department.id
        WHERE 
            department.id = $1 -- Use parameterized query to prevent SQL injection
        ORDER BY 
            employee.last_name, employee.first_name;
        `;
        
        try {
            const { rows } = await pool.query(query, [departmentId]); // Use pool for queries
            return rows.map(row => ({
                id: row.employee_id,
                first_name: row.employee_first_name,
                last_name: row.employee_last_name,
                department: row.department_name, // Ensure this matches EmployeeData structure
                // Include other fields if necessary
            })) as EmployeeData[];
        } catch (error: any) {
            console.error('Error fetching employees by department:', error.message);
            throw error; // Rethrow the error for further handling
        }
    }

    // View Department Budget
    async viewDepartmentBudget(): Promise<any[]> { // Adjust return type as necessary
        const query = `
        SELECT 
            department.id AS department_id,
            department.name AS department_name,
            COALESCE(SUM(role.salary), 0) AS total_salary_budget
        FROM 
            department
        LEFT JOIN 
            role ON role.department_id = department.id
        LEFT JOIN 
            employee ON employee.role_id = role.id
        GROUP BY 
            department.id, department.name
        ORDER BY 
            department.name;
        `;
        
        try {
            const { rows } = await pool.query(query); // Use pool for queries
            return rows; // Return the rows
        } catch (error: any) {
            console.error('Error fetching department budget:', error.message);
            throw error; // Rethrow the error for further handling
        }
    }
}
