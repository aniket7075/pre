import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { section_id, title, description, due_date, attachments } = req.body;
    const teacherId = req.user?.id;

    if (!section_id || !title || !due_date) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO homework (section_id, title, description, due_date, attachments, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [section_id, title, description, due_date, JSON.stringify(attachments || []), teacherId]
    );

    res.status(201).json({ message: 'Homework created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Create homework error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSectionHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { section_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM homework WHERE section_id = $1 ORDER BY created_at DESC',
      [section_id]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get homework error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
