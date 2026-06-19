import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getChatRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let query = '';
    const queryParams: any[] = [userId];

    if (role === 'teacher') {
      query = `SELECT cr.*, u.first_name, u.last_name FROM chat_rooms cr JOIN users u ON cr.parent_id = u.id WHERE cr.teacher_id = $1`;
    } else if (role === 'parent') {
      query = `SELECT cr.*, u.first_name, u.last_name FROM chat_rooms cr JOIN users u ON cr.teacher_id = u.id WHERE cr.parent_id = $1`;
    } else {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(query, queryParams);
    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { room_id, message, attachment_url } = req.body;
    const senderId = req.user?.id;

    if (!room_id || (!message && !attachment_url)) {
      res.status(400).json({ error: 'Message or attachment is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, message, attachment_url) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [room_id, senderId, message, attachment_url]
    );

    res.status(201).json({ message: 'Message sent', data: result.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
