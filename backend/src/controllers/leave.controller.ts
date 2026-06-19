import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const applyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { student_id, start_date, end_date, reason } = req.body;
    
    // In a full implementation, check if student_id belongs to the parent.
    const result = await pool.query(
      `INSERT INTO leave_applications (student_id, start_date, end_date, reason) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, start_date, end_date, reason]
    );

    res.status(201).json({ message: 'Leave application submitted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let query = '';
    let queryParams: any[] = [];

    if (role === 'parent') {
      // Get only leaves for this parent's children
      query = `
        SELECT la.*, s.full_name as student_name, s.grade 
        FROM leave_applications la
        JOIN students s ON la.student_id = s.id
        WHERE s.parent_id = $1
        ORDER BY la.created_at DESC
      `;
      queryParams = [userId];
    } else {
      // Teacher or Admin sees all leaves (or filtered by class)
      query = `
        SELECT la.*, s.full_name as student_name, s.grade 
        FROM leave_applications la
        JOIN students s ON la.student_id = s.id
        ORDER BY la.created_at DESC
      `;
    }

    const result = await pool.query(query, queryParams);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user?.role;

    if (role === 'parent') {
      res.status(403).json({ error: 'Unauthorized to update leave status' });
      return;
    }

    const result = await pool.query(
      `UPDATE leave_applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave application not found' });
      return;
    }

    res.status(200).json({ message: 'Leave status updated', data: result.rows[0] });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
