import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { school_id, title, content, target_audience, section_id, attachment_url } = req.body;
    const authorId = req.user?.id;

    if (!school_id || !title || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO notices (school_id, title, content, target_audience, section_id, attachment_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [school_id, title, content, target_audience || ['parent', 'teacher'], section_id || null, attachment_url, authorId]
    );

    res.status(201).json({ message: 'Notice created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { school_id, section_id } = req.query;
    const userRole = req.user?.role;

    if (!school_id) {
      res.status(400).json({ error: 'school_id is required' });
      return;
    }

    let query = `
      SELECT * FROM notices 
      WHERE school_id = $1 
      AND (section_id IS NULL OR section_id = $2)
      AND $3 = ANY(target_audience)
      ORDER BY created_at DESC
    `;
    
    // In PostgreSQL, array contains: value = ANY(array_column)
    const queryParams: any[] = [school_id, section_id || null, userRole];

    const result = await pool.query(query, queryParams);

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
