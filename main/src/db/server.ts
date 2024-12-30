import { pool } from './connection';

export interface EmployeeData{
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
                    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee AS manager ON employee.manager_id = manager.id
                ORDER BY employee.id;
            `;
            const { rows } = await pool.query(query);
            return rows; // Ensure rows match EmployeeData structure
        } catch (error: any) {
            console.error('Error fetching employees:', error.message);
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
        } catch (error: any) {
            console.error('Error deleting employee:', error.message);
            throw error;
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

// View all departments
async viewAllDepartments(): Promise<Department[]> {
    try {
        const query = 'SELECT id, name FROM department ORDER BY name;';
        const { rows } = await pool.query(query);
        return rows as Department[]; // Ensure rows match Department type
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error fetching departments:', error.message);
        }
        throw error; // Re-throw the error for further handling
    }
}

// View all Roles
async viewAllRoles(): Promise<Role[]> {
    try {
        const query = 'SELECT id, name FROM role ORDER BY name;';
        const { rows } = await pool.query(query);
        return rows as Role[]; // Ensure rows match Department type
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error fetching roles:', error.message);
        }
        throw error; // Re-throw the error for further handling
    }
}


// View employees by department
async viewEmployeesByDepartment(departmentId: number): Promise<EmployeeData[]> {
    try {
        const query = `
            SELECT 
                employee.id, 
                employee.first_name, 
                employee.last_name, 
                role.title AS role, 
                department.name AS department, 
                role.salary, 
                CONCAT(manager.first_name, ' ', manager.last_name) AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee AS manager ON employee.manager_id = manager.id
            WHERE department.id = $1
            ORDER BY employee.id;
        `;
        const { rows } = await pool.query(query, [departmentId]);
        return rows as EmployeeData[]; // Ensure rows match EmployeeData structure
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error fetching employees by department (ID: ${departmentId}):`, error.message);
        }
        throw error; // Re-throw the error for further handling
    }
}
}