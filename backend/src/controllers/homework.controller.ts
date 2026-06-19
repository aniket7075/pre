import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade, subject, title, description, due_date, reference_link } = req.body;
    const teacherId = req.user?.id || null;

    if (!grade || !subject || !title || !description || !due_date) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Process uploaded files if any
    const files = req.files as Express.Multer.File[];
    let attachments = '[]';
    
    if (files && files.length > 0) {
      const fileUrls = files.map(f => `/uploads/${f.filename}`);
      attachments = JSON.stringify(fileUrls);
    }

    const result = await pool.query(
      `INSERT INTO homework (grade, subject, title, description, due_date, reference_link, attachments, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [grade, subject, title, description, due_date, reference_link || null, attachments, teacherId]
    );

    res.status(201).json({ message: 'Homework created successfully', data: result.rows[0] });
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
