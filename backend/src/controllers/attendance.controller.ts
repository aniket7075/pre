import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getClassStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade } = req.params;
    const result = await pool.query(
      `SELECT id, full_name, grade FROM students WHERE grade = $1 ORDER BY full_name ASC`,
      [grade]
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkMarkAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { date, records } = req.body; // records: [{student_id, status}]
    const teacherId = req.user?.id;

    if (!date || !records || !Array.isArray(records)) {
      res.status(400).json({ error: 'Missing or invalid fields' });
      return;
    }

    await client.query('BEGIN');

    for (const record of records) {
      await client.query(
        `INSERT INTO attendance (student_id, date, status, marked_by) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (student_id, date) 
         DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by`,
        [record.student_id, date, record.status, teacherId]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
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
