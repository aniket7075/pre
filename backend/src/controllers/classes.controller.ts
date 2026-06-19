import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getClasses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.created_at, c.class_teacher_id, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name 
       FROM classes c
       LEFT JOIN users u ON c.class_teacher_id = u.id
       ORDER BY c.name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, class_teacher_id } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Class name is required' });
    return;
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO classes (name, description, class_teacher_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, class_teacher_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create class error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'A class with this name already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateClass = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, class_teacher_id } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Class name is required' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE classes 
       SET name = $1, description = $2, class_teacher_id = $3
       WHERE id = $4 RETURNING *`,
      [name, description, class_teacher_id || null, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteClass = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM classes WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    // If foreign key constraint fails
    if (error.code === '23503') {
      res.status(400).json({ error: 'Cannot delete class because it has associated sections or students' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
