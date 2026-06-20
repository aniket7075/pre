import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Homework controller — aligned with schema.sql which has section_id, title, description, due_date, attachments, created_by.
 * We use a simplified "grade" approach in a custom column added via migration (or fall back to fetching all).
 * The frontend passes grade as a query param.
 */

export const createHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, due_date, reference_link, grade } = req.body;
    const teacherId = req.user?.id || null;

    if (!title || !description || !due_date) {
      res.status(400).json({ error: 'title, description, and due_date are required' });
      return;
    }

    // Process uploaded files
    const files = req.files as Express.Multer.File[];
    let attachments: string[] = [];
    if (files && files.length > 0) {
      attachments = files.map(f => `/uploads/${f.filename}`);
    }

    // Try to find a section_id matching the grade if provided
    let sectionId: string | null = null;
    if (grade) {
      const sectionRes = await pool.query(
        `SELECT s.id FROM sections s 
         JOIN classes c ON s.class_id = c.id 
         WHERE LOWER(c.name) = LOWER($1) LIMIT 1`,
        [grade]
      );
      if (sectionRes.rows.length > 0) sectionId = sectionRes.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO homework (section_id, title, description, due_date, attachments, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [sectionId, title, description, due_date, JSON.stringify(attachments), teacherId]
    );

    // Add extra fields to response for frontend
    res.status(201).json({
      message: 'Homework created successfully',
      data: {
        ...result.rows[0],
        grade: grade || null,
        reference_link: reference_link || null,
      }
    });
  } catch (error) {
    console.error('Create homework error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSectionHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade } = req.params;

    let query: string;
    let params: any[] = [];

    if (!grade || grade === 'dummy_section_id' || grade === 'dummy_grade' || grade === 'all') {
      // Return all recent homework
      query = `
        SELECT h.*, 
               u.first_name || ' ' || u.last_name AS teacher_name,
               c.name AS class_name
        FROM homework h
        LEFT JOIN users u ON h.created_by = u.id
        LEFT JOIN sections sec ON h.section_id = sec.id
        LEFT JOIN classes c ON sec.class_id = c.id
        ORDER BY h.created_at DESC
        LIMIT 50
      `;
    } else {
      // Try to match grade by class name
      query = `
        SELECT h.*, 
               u.first_name || ' ' || u.last_name AS teacher_name,
               c.name AS class_name
        FROM homework h
        LEFT JOIN users u ON h.created_by = u.id
        LEFT JOIN sections sec ON h.section_id = sec.id
        LEFT JOIN classes c ON sec.class_id = c.id
        WHERE LOWER(c.name) = LOWER($1)
        ORDER BY h.created_at DESC
      `;
      params.push(grade);
    }

    const result = await pool.query(query, params);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get homework error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteHomework = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM homework WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Homework not found' });
      return;
    }
    res.json({ message: 'Homework deleted' });
  } catch (error) {
    console.error('Delete homework error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
