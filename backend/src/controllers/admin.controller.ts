import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';

// Get all staff members
export const getAllStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_active 
       FROM users 
       WHERE role IN ('teacher', 'non_teaching_staff')`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a staff member
export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, first_name, last_name`,
      [email, passwordHash, role, firstName, lastName]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Get all students
export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.admission_number, u.email as parent_email
       FROM students s
       LEFT JOIN users u ON s.parent_id = u.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new Family (Parent + Multiple Students)
export const addFamily = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { parentName, contactNumber, email, children } = req.body;

    if (!parentName || !contactNumber || !children || children.length === 0) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await client.query('BEGIN');

    // Insert Parent
    const parentResult = await client.query(
      `INSERT INTO parents (full_name, contact_number, email) VALUES ($1, $2, $3) RETURNING id`,
      [parentName, contactNumber, email]
    );
    const parentId = parentResult.rows[0].id;

    // Insert Children
    for (const child of children) {
      await client.query(
        `INSERT INTO students (parent_id, full_name, grade, age) VALUES ($1, $2, $3, $4)`,
        [parentId, child.name, child.grade, child.age ? parseInt(child.age) : null]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Family added successfully', parentId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding family:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
