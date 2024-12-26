import dotenv from 'dotenv';
dotenv.config();

// Import Pool from node-postgres
import pg from 'pg';
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME,
  port: 5432,
});

// Connect to the database and log the status
const connectToDb = async (): Promise<void> => {
  try {
    await pool.connect();
    console.log('Connected to the database successfully.');
  } catch (err: unknown) {
    const error = err as Error; // Explicitly cast to Error for better type safety
    console.error('Error connecting to the database:', error.message || error);
    process.exit(1); // Exit the process with failure
  }
};

// Export the pool and the connect function for usage in other modules
export { pool, connectToDb };
