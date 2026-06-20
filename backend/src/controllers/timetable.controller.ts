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

export const updateTimetableEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { grade, day_of_week, period_number, subject, start_time, end_time } = req.body;
  if (!grade || !day_of_week || !period_number || !subject || !start_time || !end_time) {
    res.status(400).json({ error: 'Missing required timetable fields' });
    return;
  }
  try {
    const result = await pool.query(
      `UPDATE timetables 
       SET grade = $1, day_of_week = $2, period_number = $3, subject = $4, start_time = $5, end_time = $6
       WHERE id = $7 RETURNING *`,
      [grade, day_of_week, parseInt(period_number), subject, start_time, end_time, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Timetable entry not found' });
      return;
    }
    res.json({ message: 'Timetable entry updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update timetable entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTimetableEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM timetables WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Timetable entry not found' });
      return;
    }
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
