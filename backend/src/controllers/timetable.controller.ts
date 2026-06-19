import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTimetable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM timetables WHERE grade = $1 ORDER BY day_of_week, period_number ASC`,
      [grade]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTimetableEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { grade, day_of_week, period_number, subject, start_time, end_time } = req.body;
    
    const role = req.user?.role;
    if (role === 'parent') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO timetables (grade, day_of_week, period_number, subject, start_time, end_time) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [grade, day_of_week, period_number, subject, start_time, end_time]
    );

    res.status(201).json({ message: 'Timetable entry created', data: result.rows[0] });
  } catch (error) {
    console.error('Create timetable entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
