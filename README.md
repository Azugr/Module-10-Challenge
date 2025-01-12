# Employee Tracker

## Description
This is a command-line application built in TypeScript to manage a company's employee database. It utilizes PostgreSQL as the database management system and provides functionality to manage departments, roles, and employees. The application allows users to:

- View all departments, roles, and employees.
- Add new departments, roles, and employees.
- Update employee roles and managers.
- View employees by manager and department.
- View the total utilized budget for each department.

The application adheres to a normalized relational database schema for managing the data efficiently.

---

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Schema Design](#schema-design)
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

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- TypeScript globally installed (`npm install -g typescript`)

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Open your PostgreSQL client and run the `db/schema.sql` file to create the database and tables:
     ```bash
     psql -U <username> -f db/schema.sql
     ```
   - Populate the database with initial data using `db/seeds.sql`:
     ```bash
     psql -U <username> -f db/seeds.sql
     ```

4. Configure environment variables:
   - Rename `.env.EXAMPLE` to `.env` and update the following placeholders:
     ```env
     DB_USER=<your_db_user>
     DB_PASSWORD=<your_db_password>
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=employees_db
     ```

5. Compile TypeScript to JavaScript:
   ```bash
   npx tsc
   ```

6. Start the application:
   ```bash
   node dist/server.js
   ```

---

## Usage

1. Start the application:
   ```bash
   node dist/server.js
   ```

2. Navigate through the menus:
   - Select actions such as viewing, adding, updating, or deleting departments, roles, and employees.
   - View hierarchical data such as employees by manager or department.

3. Use Ctrl+C to exit the application.

---

## Schema Design
The database schema is structured as follows:

![Database Schema](./assets/image_1.png)

### Tables:
1. **`department`**
    - `id`: Primary key (unique identifier for departments).
    - `name`: Unique name for the department (e.g., IT, HR).

2. **`role`**
    - `id`: Primary key (unique identifier for roles).
    - `title`: Unique name for the role (e.g., Software Engineer).
    - `salary`: Salary associated with the role.
    - `department`: Foreign key referencing the `department` table.

3. **`employee`**
    - `id`: Primary key (unique identifier for employees).
    - `first_name`: Employee's first name.
    - `last_name`: Employee's last name.
    - `role_id`: Foreign key referencing the `role` table.
    - `manager_id`: Self-referential foreign key for hierarchical relationships (e.g., an employee's manager).

---

## Walkthrough Video
[Watch the walkthrough video here](#) *(Replace with video link)*

---

## Project Structure
```
Main/
├── assets/
│   ├── image_1.png        # Database schema diagram
├── db/
│   ├── query.sql          # SQL queries for data retrieval
│   ├── schema.sql         # Database schema
│   ├── seeds.sql          # Initial seed data
├── src/
│   ├── connection.ts      # Database connection file
│   ├── server.ts          # Main application logic (TypeScript)
├── .env.EXAMPLE           # Environment variable template
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
├── README.md              # Project documentation
```

---

## Technologies Used

- **Node.js**: JavaScript runtime.
- **TypeScript**: Static typing for JavaScript.
- **PostgreSQL**: Relational database management system.
- **Inquirer.js**: Command-line user interface for managing interactions.

---

## Contributing
Feel free to contribute to this project by submitting issues or pull requests. Please ensure your code adheres to the existing coding style.

---

## License
This project is licensed under the MIT License.


