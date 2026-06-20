import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, audience, date } = req.body;
    const authorId = req.user?.id || null;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    // Get or create a default school for backward compat (multi-tenant lite)
    let schoolId: string | null = null;
    try {
      const schoolRes = await pool.query('SELECT id FROM schools ORDER BY created_at ASC LIMIT 1');
      if (schoolRes.rows.length > 0) schoolId = schoolRes.rows[0].id;
    } catch { /* ignore */ }

    const result = await pool.query(
      `INSERT INTO notices (title, content, audience, date, created_by, school_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, audience || 'all', date || new Date().toISOString().split('T')[0], authorId, schoolId]
    );

    res.status(201).json({ message: 'Notice published', data: result.rows[0] });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.first_name || ' ' || u.last_name AS author_name
       FROM notices n
       LEFT JOIN users u ON n.created_by = u.id
       ORDER BY n.created_at DESC`
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM notices WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Notice not found' });
      return;
    }
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
