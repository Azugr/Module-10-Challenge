-- View Employees by Manager
SELECT 
    employee.id AS employee_id,
    employee.first_name AS employee_first_name,
    employee.last_name AS employee_last_name,
    manager.id AS manager_id,
    CONCAT(COALESCE(manager.first_name, 'No Manager'), ' ', COALESCE(manager.last_name, '')) AS manager_name
FROM 
    employee
LEFT JOIN 
    employee AS manager ON employee.manager_id = manager.id
ORDER BY 
    manager_name;


-- View Employees by Department
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
ORDER BY 
    department.name, employee.last_name, employee.first_name;

-- View Department Budget
SELECT 
    department.id AS department_id,
    department.name AS department_name,
    SUM(role.salary) AS total_salary_budget
FROM 
    role
JOIN 
    department ON role.department_id = department.id
JOIN 
    employee ON employee.role_id = role.id
GROUP BY 
    department.id, department.name
ORDER BY 
    department.name;


