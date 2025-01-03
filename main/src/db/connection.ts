import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432, 
});

// Function to test database connection
const connectToDb = async (): Promise<void> => {
  const client = await pool.connect(); // Get a client from the pool
  try {
    console.log('Connected to the database successfully.');
  } catch (err: unknown) {
    const error = err as Error; // Explicitly cast to Error for better type safety
    console.error('Error connecting to the database:', error.message || error);
    process.exit(1); // Exit the process with failure
  } finally {
    client.release(); // Release the client back to the pool
  }
};

// Export the pool and the connect function
export { pool, connectToDb };
