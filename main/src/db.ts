import {pool} from './connection.js';

export interface EmployeeData {
    employee_id: number;
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
    salary: number;
    department_id: number;
}

export interface Manager {
    manager_id: number; 
    first_name: string;
    last_name: string;
    role: string; 
    department: string; 
}

export interface ManagerChoice {
    name: string;
    value: number | null; 
}

export default class Db {

constructor() {
    }

    // Helper to query the database
    private async query(sql: string, params: any[] = []): Promise<any[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(sql, params);
            return result.rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Add Employee
    async addEmployee(firstName: string, lastName: string, roleId: number, managerId: number | null): Promise<EmployeeData> {
        const sql = `
            INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, first_name, last_name, role_id, manager_id;
        `;
        const result = await this.query(sql, [firstName, lastName, roleId, managerId]);
        return result[0];
    }

    // Update Employee
    async updateEmployee(employeeId: number, roleId: number): Promise<EmployeeData> {
        const sql = `
            UPDATE employee
            SET role_id = $1
            WHERE id = $2
            RETURNING id, first_name, last_name, role_id, manager_id;
        `;
        const result = await this.query(sql, [roleId, employeeId]);
        return result[0];
    }

    // Delete Employee
    async deleteEmployee(employeeId: number): Promise<void> {
        const sql = `
            DELETE FROM employee
            WHERE id = $1;
        `;
        await this.query(sql, [employeeId]);
    }
    
    //Updadte Employee Manager
    async updateEmployeeManager(employeeId: number, managerId: number | null): Promise<void> {
        const sql = `
            UPDATE employee
            SET manager_id = $1
            WHERE id = $2;
        `;
        await this.query(sql, [managerId, employeeId]);
    }
    
    // View All Employees
    async viewAllEmployees(): Promise<EmployeeData[]> {
        const sql = `
            SELECT 
                e.id AS employee_id,
                e.first_name,
                e.last_name,
                r.title AS role,
                d.name AS department,
                r.salary,
                CONCAT(COALESCE(m.first_name, ''), ' ', COALESCE(m.last_name, '')) AS manager
            FROM employee e
            LEFT JOIN role r ON e.role_id = r.id
            LEFT JOIN department d ON r.department_id = d.id
            LEFT JOIN employee m ON e.manager_id = m.id;
        `;
        return this.query(sql);
    }    

    async viewAllManagers(): Promise<Manager[]> {
        console.log('Loading managers, please wait...');
        const sql = `
            SELECT DISTINCT
                m.id AS manager_id,
                m.first_name,
                m.last_name,
                r.title AS role,
                d.name AS department
            FROM employee e
            JOIN employee m ON e.manager_id = m.id
            LEFT JOIN role r ON m.role_id = r.id
            LEFT JOIN department d ON r.department_id = d.id
            ORDER BY m.last_name, m.first_name;
        `;
        return this.query(sql);
    }

    // Add Role
    async addRole(title: string, salary: number, departmentId: number): Promise<Role> {
        const sql = `
            INSERT INTO role (title, salary, department_id)
            VALUES ($1, $2, $3)
            RETURNING id, title, salary, department_id;
        `;
        const result = await this.query(sql, [title, salary, departmentId]);
        return result[0]; // Return the newly created role
    }

    // Update Role
    async updateRole(roleId: number, updates: { title?: string; salary?: number }): Promise<void> {
        const setClause: string[] = [];
        const params: any[] = [];

        if (updates.title) {
            setClause.push(`title = $${params.length + 1}`);
            params.push(updates.title);
        }
        if (updates.salary !== undefined) {
            setClause.push(`salary = $${params.length + 1}`);
            params.push(updates.salary);
        }

        if (setClause.length === 0) {
            throw new Error('No updates provided');
        }

        const sql = `
            UPDATE role
            SET ${setClause.join(', ')}
            WHERE id = $${params.length + 1}
            RETURNING id, title, salary;
        `;
        params.push(roleId); 

        await this.query(sql, params);
    }

    // Delete Role
    async deleteRole(roleId: number): Promise<void> {
        const sql = `
            DELETE FROM role
            WHERE id = $1;
        `;
        await this.query(sql, [roleId]);
    }

    // View All Roles
    async viewAllRoles(): Promise<Role[]> {
        console.log('Loading roles, please wait...');
        const sql = `
            SELECT 
                r.id AS role_id,
                r.title,
                r.salary,
                d.name AS department
            FROM role r
            LEFT JOIN department d ON r.department_id = d.id;
        `;
        return this.query(sql);
    }

    // Add Department
    async addDepartment(name: string): Promise<Department> {
        const sql = `
            INSERT INTO department (name)
            VALUES ($1)
            RETURNING id, name;
        `;
        try {
            const result = await this.query(sql, [name]);
            return result[0]; // Return the newly created department
        } catch (error) {
            console.error('Error adding department:', error);
            throw error; // Rethrow the error if needed
        }
    }
    
    // Update Department
    async updateDepartment(departmentId: number, newName: string): Promise<Department> {
        const sql = `
            UPDATE department
            SET name = $1
            WHERE id = $2
            RETURNING id, name;
        `;
        try {
            const result = await this.query(sql, [newName, departmentId]);
            return result[0]; // Return the updated department
        } catch (error) {
            console.error('Error updating department:', error);
            throw error; // Rethrow the error if needed
        }
    }
    
    // Delete Department
    async deleteDepartment(departmentId: number): Promise<void> {
        const sql = `
            DELETE FROM department
            WHERE id = $1;
        `;
        try {
            await this.query(sql, [departmentId]);
        } catch (error) {
            console.error('Error deleting department:', error);
            throw error; // Rethrow the error if needed
        }
    }
    
    // View All Departments
    async viewAllDepartments(): Promise<Department[]> {
        const sql = `
            SELECT 
                id AS department_id,
                name AS department_name
            FROM department;
        `;
        return this.query(sql);
    }
}