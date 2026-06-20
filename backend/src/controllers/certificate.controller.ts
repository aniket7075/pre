import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role;
    const email = req.user?.email;

    let query = '';
    let queryParams: any[] = [];

    if (role === 'parent') {
      let parentId = null;
      if (email) {
        const parentRes = await pool.query('SELECT id FROM parents WHERE email = $1', [email]);
        if (parentRes.rows.length > 0) {
          parentId = parentRes.rows[0].id;
        }
      }
      query = `
        SELECT c.*, s.first_name || ' ' || s.last_name as student_name 
        FROM certificates c
        JOIN students s ON c.student_id = s.id
        WHERE s.parent_id = $1
        ORDER BY c.created_at DESC
      `;
      queryParams = [parentId];
    } else {
      query = `
        SELECT c.*, s.first_name || ' ' || s.last_name as student_name 
        FROM certificates c
        JOIN students s ON c.student_id = s.id
        ORDER BY c.created_at DESC
      `;
    }

    const result = await pool.query(query, queryParams);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const applyCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { student_id, type, reason } = req.body;
    
    const result = await pool.query(
      `INSERT INTO certificates (student_id, type, reason) VALUES ($1, $2, $3) RETURNING *`,
      [student_id, type, reason]
    );

    res.status(201).json({ message: 'Certificate applied', data: result.rows[0] });
  } catch (error) {
    console.error('Apply certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCertificateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user?.role;
    
    if (role === 'parent') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      `UPDATE certificates SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.status(200).json({ message: 'Status updated', data: result.rows[0] });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
