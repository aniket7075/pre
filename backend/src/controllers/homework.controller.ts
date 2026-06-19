import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade, title, description, due_date } = req.body;
    const teacherId = req.user?.id || null;

    if (!grade || !title || !description || !due_date) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO homework (grade, title, description, due_date, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [grade, title, description, due_date, teacherId]
    );

    res.status(201).json({ message: 'Homework assigned', data: result.rows[0] });
  } catch (error) {
    console.error('Create homework error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSectionHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade } = req.params;

    // For prototype demo, if grade is dummy, return all
    let query = 'SELECT * FROM homework ORDER BY created_at DESC';
    let params = [];
    
    if (grade && grade !== 'dummy_section_id' && grade !== 'dummy_grade') {
      query = 'SELECT * FROM homework WHERE grade = $1 ORDER BY created_at DESC';
      params.push(grade);
    }

    const result = await pool.query(query, params);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get homework error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
