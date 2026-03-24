import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Connection pool — reuses connections instead of creating a new one per query
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('📦 Connected to PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Helper function — run a query and return rows
export const query = async (text: string, params?: unknown[]) => {
  const result = await pool.query(text, params);
  return result;
};

export default pool;
