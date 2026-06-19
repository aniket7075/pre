import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, audience, date } = req.body;
    const authorId = req.user?.id || null;

    if (!title || !content || !date) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO notices (title, content, audience, date, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, audience || 'all', date, authorId]
    );

    res.status(201).json({ message: 'Notice published', data: result.rows[0] });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // For demo, return all notices regardless of school_id/role since we dropped them from schema
    const result = await pool.query(`SELECT * FROM notices ORDER BY created_at DESC`);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
