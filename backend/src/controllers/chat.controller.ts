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
      query = `
        SELECT cr.id, cr.created_at,
               u.id AS other_user_id, u.first_name, u.last_name, u.profile_picture_url,
               s.first_name || ' ' || s.last_name AS student_name,
               (SELECT message FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS last_message_time
        FROM chat_rooms cr 
        JOIN users u ON cr.parent_id = u.id 
        LEFT JOIN students s ON cr.student_id = s.id
        WHERE cr.teacher_id = $1
        ORDER BY last_message_time DESC NULLS LAST
      `;
    } else if (role === 'parent') {
      query = `
        SELECT cr.id, cr.created_at,
               u.id AS other_user_id, u.first_name, u.last_name, u.profile_picture_url,
               s.first_name || ' ' || s.last_name AS student_name,
               (SELECT message FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) AS last_message_time
        FROM chat_rooms cr 
        JOIN users u ON cr.teacher_id = u.id 
        LEFT JOIN students s ON cr.student_id = s.id
        WHERE cr.parent_id = $1
        ORDER BY last_message_time DESC NULLS LAST
      `;
    } else {
      // Admin sees all rooms
      query = `
        SELECT cr.id, cr.created_at,
               t.first_name || ' ' || t.last_name AS teacher_name,
               p.first_name || ' ' || p.last_name AS parent_name,
               s.first_name || ' ' || s.last_name AS student_name
        FROM chat_rooms cr
        JOIN users t ON cr.teacher_id = t.id
        JOIN users p ON cr.parent_id = p.id
        LEFT JOIN students s ON cr.student_id = s.id
        ORDER BY cr.created_at DESC
      `;
      queryParams.length = 0;
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
    const { teacher_id, parent_id, student_id } = req.body;

    if (!teacher_id || !parent_id) {
      res.status(400).json({ error: 'teacher_id and parent_id are required' });
      return;
    }

    // Check if room already exists
    const existing = await pool.query(
      `SELECT * FROM chat_rooms WHERE teacher_id = $1 AND parent_id = $2 AND (student_id = $3 OR student_id IS NULL)`,
      [teacher_id, parent_id, student_id || null]
    );
    
    if (existing.rows.length > 0) {
      res.status(200).json({ data: existing.rows[0] });
      return;
    }

    const result = await pool.query(
      `INSERT INTO chat_rooms (teacher_id, parent_id, student_id) VALUES ($1, $2, $3) RETURNING *`,
      [teacher_id, parent_id, student_id || null]
    );

    res.status(201).json({ message: 'Chat room created', data: result.rows[0] });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { room_id } = req.params;
    const { limit = '50', before } = req.query;

    let query = `
      SELECT cm.*, u.first_name, u.last_name, u.role, u.profile_picture_url
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.room_id = $1
    `;
    const params: any[] = [room_id];

    if (before) {
      query += ` AND cm.created_at < $2`;
      params.push(before);
    }

    query += ` ORDER BY cm.created_at ASC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit as string));

    const result = await pool.query(query, params);

    // Mark messages as read
    await pool.query(
      `UPDATE chat_messages SET is_read = true WHERE room_id = $1 AND sender_id != $2`,
      [room_id, req.user?.id]
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { room_id, message, attachment_url } = req.body;
    const senderId = req.user?.id;

    if (!room_id || (!message && !attachment_url)) {
      res.status(400).json({ error: 'room_id and message (or attachment_url) are required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, message, attachment_url) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [room_id, senderId, message || null, attachment_url || null]
    );

    res.status(201).json({ message: 'Message sent', data: result.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM chat_messages cm
       JOIN chat_rooms cr ON cm.room_id = cr.id
       WHERE cm.is_read = false AND cm.sender_id != $1
         AND (cr.teacher_id = $1 OR cr.parent_id = $1)`,
      [userId]
    );
    res.json({ unread: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
