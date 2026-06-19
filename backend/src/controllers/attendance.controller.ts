import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { student_id, section_id, date, status, remarks } = req.body;
    const teacherId = req.user?.id;

    if (!student_id || !section_id || !date || !status) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Upsert attendance record
    const result = await pool.query(
      `INSERT INTO attendance (student_id, section_id, date, status, remarks, marked_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (student_id, date) 
       DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, marked_by = EXCLUDED.marked_by
       RETURNING *`,
      [student_id, section_id, date, status, remarks, teacherId]
    );

    res.status(200).json({ message: 'Attendance marked successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { student_id } = req.params;
    const { month, year } = req.query;

    let query = 'SELECT * FROM attendance WHERE student_id = $1';
    const queryParams: any[] = [student_id];

    if (month && year) {
      query += ' AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3';
      queryParams.push(month, year);
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, queryParams);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
