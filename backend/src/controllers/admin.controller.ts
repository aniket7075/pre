import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';

// Get all staff members
export const getAllStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_active, department, designation, phone_number
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
  const { email, password, firstName, lastName, role, department, designation, phoneNumber } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, department, designation, phone_number) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, role, first_name, last_name, department, designation`,
      [email, passwordHash, role, firstName, lastName, department, designation, phoneNumber]
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

// Update a staff member
export const updateStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, firstName, lastName, role, isActive, department, designation, phoneNumber } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users 
       SET email = $1, first_name = $2, last_name = $3, role = $4, is_active = $5, department = $6, designation = $7, phone_number = $8, updated_at = NOW() 
       WHERE id = $9 RETURNING id, email, first_name, last_name, role, is_active, department, designation`,
      [email, firstName, lastName, role, isActive, department, designation, phoneNumber, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Deactivate (Delete) a staff member
export const deleteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }
    res.json({ message: 'Staff deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all students
export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.admission_number, s.is_active, p.email as parent_email, p.full_name as parent_name, p.contact_number
       FROM students s
       LEFT JOIN parents p ON s.parent_id = p.id`
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

    // Create User account for Parent (so they can login)
    try {
      const salt = await bcrypt.genSalt(10);
      const tempPassword = await bcrypt.hash('password123', salt); // Default password
      await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
         [email, tempPassword, 'parent', parentName.split(' ')[0], parentName.split(' ').slice(1).join(' ') || '', contactNumber]
      );
    } catch (e: any) {
      console.error('User creation failed (might already exist):', e.message);
    }

    // Insert Children
    for (const child of children) {
      const admissionNum = child.admissionNumber || `ADM-${Math.floor(Math.random() * 1000000)}`;
      const childFirstName = child.firstName || (child.name ? child.name.split(' ')[0] : 'Unknown');
      const childLastName = child.lastName || (child.name ? child.name.split(' ').slice(1).join(' ') : '');
      
      await client.query(
        `INSERT INTO students (parent_id, first_name, last_name, admission_number) VALUES ($1, $2, $3, $4)`,
        [parentId, childFirstName, childLastName, admissionNum]
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

// Update a student
export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, admissionNumber, isActive } = req.body;
  try {
    const result = await pool.query(
      `UPDATE students 
       SET first_name = $1, last_name = $2, admission_number = $3, is_active = $4, updated_at = NOW() 
       WHERE id = $5 RETURNING id`,
      [firstName, lastName, admissionNumber, isActive, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Deactivate (Delete) a student
export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE students SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
