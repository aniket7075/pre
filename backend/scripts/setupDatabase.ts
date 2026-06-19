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

    // Create 'attendance' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        marked_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, date)
      );
    `);
    console.log('✅ attendance table created or already exists.');

    // Create 'fee_structures' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fee_structures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fee_type VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        grade VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ fee_structures table created or already exists.');

    // Create 'student_fees' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_fees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE CASCADE,
        amount_due NUMERIC(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, fee_structure_id)
      );
    `);
    console.log('✅ student_fees table created or already exists.');

    // Create 'payments' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_fee_id UUID REFERENCES student_fees(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES parents(id),
        amount_paid NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ payments table created or already exists.');

    // Create 'homework' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS homework (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        grade VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        due_date VARCHAR(100) NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ homework table created or already exists.');

    // Create 'notices' table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        audience VARCHAR(50) DEFAULT 'all',
        date VARCHAR(100) NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ notices table created or already exists.');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
