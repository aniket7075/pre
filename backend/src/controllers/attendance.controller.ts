import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getClassStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade } = req.params;
    const result = await pool.query(
      `SELECT id, first_name || ' ' || last_name AS full_name, grade, admission_number, profile_image_url
       FROM students WHERE grade = $1 AND is_active = true ORDER BY first_name ASC`,
      [grade]
    );
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllStudentsForAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, first_name || ' ' || last_name AS full_name, grade, admission_number, profile_image_url
       FROM students WHERE is_active = true ORDER BY grade ASC, first_name ASC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get all students for attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkMarkAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { date, records } = req.body;
    const teacherId = req.user?.id;

    if (!date || !records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'Missing or invalid fields: date and records array required' });
      return;
    }

    await client.query('BEGIN');

    for (const record of records) {
      if (!record.student_id || !record.status) continue;
      await client.query(
        `INSERT INTO attendance (student_id, date, status, marked_by) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (student_id, date) 
         DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by`,
        [record.student_id, date, record.status.toLowerCase(), teacherId]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: `Attendance marked for ${records.length} student(s)` });
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

    let query = 'SELECT id, date, status, remarks FROM attendance WHERE student_id = $1';
    const queryParams: any[] = [student_id];

    if (month && year) {
      query += ' AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3';
      queryParams.push(month, year);
    } else if (year) {
      query += ' AND EXTRACT(YEAR FROM date) = $2';
      queryParams.push(year);
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, queryParams);

    // Also return summary counts
    const summary = { present: 0, absent: 0, late: 0, leave: 0, half_day: 0 };
    result.rows.forEach(r => {
      const s = r.status?.toLowerCase();
      if (s in summary) summary[s as keyof typeof summary]++;
    });

    res.status(200).json({ data: result.rows, summary });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
