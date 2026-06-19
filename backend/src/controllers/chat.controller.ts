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

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { teacher_id, parent_id } = req.body;
    
    const existing = await pool.query(`SELECT * FROM chat_rooms WHERE teacher_id = $1 AND parent_id = $2`, [teacher_id, parent_id]);
    if (existing.rows.length > 0) {
       res.status(200).json({ data: existing.rows[0] });
       return;
    }

    const result = await pool.query(
      `INSERT INTO chat_rooms (teacher_id, parent_id) VALUES ($1, $2) RETURNING *`,
      [teacher_id, parent_id]
    );

    res.status(201).json({ message: 'Room created', data: result.rows[0] });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { room_id } = req.params;
    const result = await pool.query(`SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at ASC`, [room_id]);
    res.status(200).json({ data: result.rows });
  } catch(error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { room_id, message } = req.body;
    const senderId = req.user?.id;

    if (!room_id || !message) {
      res.status(400).json({ error: 'Message and room_id required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, message) 
       VALUES ($1, $2, $3) RETURNING *`,
      [room_id, senderId, message]
    );

    res.status(201).json({ message: 'Message sent', data: result.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
