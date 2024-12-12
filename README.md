
# Module 10 Challenge: Employee Tracker

## Description

This command-line application allows business owners to manage their company's employee database. Built using **Node.js**, **Inquirer**, and **PostgreSQL**, it provides an intuitive interface to view and manage departments, roles, employees, and managers efficiently.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Walkthrough Video](#walkthrough-video)
- [License](#license)

---

## Features

- **Core Functionality**:
  - View all departments, roles, employees, and managers.
  - Add a new department, role, employee, or manager.
  - Update existing records, such as:
    - Department names
    - Role titles and salaries
    - Employee details (name, role, manager)
    - Manager details
  - Delete departments, roles, employees, and managers.

- **Bonus Features**:
  - Update employee managers.
  - View employees by manager or department.
  - View the total utilized budget of a department.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Azugr/Module-10-Challenge
   cd Module-10-Challenge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   - Create a PostgreSQL database.
   - Execute the SQL scripts in `db/schema.sql` and `db/seeds.sql`.
4. Configure the database connection in `src/app.js`:
   ```javascript
   const client = new Client({
       connectionString: 'postgresql://username:password@localhost:5432/employee_db',
   });
   ```

---

## Usage

1. Run the application:
   ```bash
   npm start
   ```
2. Use the interactive menu to:
   - Manage **departments**: Add, delete, and update department names.
   - Manage **roles**: Add, delete, and update role details (title, salary, department).
   - Manage **employees**: Add, delete, and update employee details (name, role, manager).
   - Manage **managers**: Add, delete, and update manager information (e.g., name and assigned employees).

---

## Database Schema

The database schema is designed with the following core tables:

### `department`
| Column | Type        | Description              |
|--------|-------------|--------------------------|
| `id`   | SERIAL      | Primary key              |
| `name` | VARCHAR(30) | Name of the department   |

### `role`
| Column          | Type        | Description                          |
|------------------|-------------|--------------------------------------|
| `id`            | SERIAL      | Primary key                          |
| `title`         | VARCHAR(30) | Name of the role                     |
| `salary`        | DECIMAL     | Salary for the role                  |
| `department_id` | INTEGER     | Foreign key referencing `department` |

### `employee`
| Column         | Type        | Description                          |
|-----------------|-------------|--------------------------------------|
| `id`           | SERIAL      | Primary key                          |
| `first_name`   | VARCHAR(30) | Employee's first name                |
| `last_name`    | VARCHAR(30) | Employee's last name                 |
| `role_id`      | INTEGER     | Foreign key referencing `role`       |
| `manager_id`   | INTEGER     | Foreign key referencing `employee`   |

---

## Walkthrough Video
[Watch the walkthrough video here](#) *(Replace with video link)*

---

## License

This project is licensed under the [MIT License](LICENSE).
