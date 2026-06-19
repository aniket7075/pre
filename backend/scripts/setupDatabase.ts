import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starting database setup...');
    
    // Create 'parents' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ parents table created or already exists.');

    // Create 'students' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        grade VARCHAR(100) NOT NULL,
        age INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ students table created or already exists.');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
