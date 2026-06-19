import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTransportRoutes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { school_id } = req.query;

    const result = await pool.query(
      `SELECT * FROM transport_routes WHERE school_id = $1 ORDER BY route_name ASC`,
      [school_id]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get transport routes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentTransport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { student_id } = req.params;

    const result = await pool.query(
      `SELECT st.*, tr.route_name, tr.driver_name, tr.driver_phone, tr.vehicle_number 
       FROM student_transport st
       JOIN transport_routes tr ON st.route_id = tr.id
       WHERE st.student_id = $1`,
      [student_id]
    );

    res.status(200).json({ data: result.rows[0] || null });
  } catch (error) {
    console.error('Get student transport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
