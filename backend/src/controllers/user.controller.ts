import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      'SELECT id, email, phone_number, role, first_name, last_name, profile_picture_url FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { first_name, last_name, phone_number } = req.body;

    if (!first_name?.trim() || !last_name?.trim()) {
      res.status(400).json({ error: 'First name and last name are required' });
      return;
    }

    const result = await pool.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, phone_number = COALESCE(NULLIF($3, ''), phone_number), updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, phone_number, role, first_name, last_name, profile_picture_url`,
      [first_name.trim(), last_name.trim(), phone_number || '', userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0], message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyChildren = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;

    const result = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.admission_number, s.grade, s.age, s.profile_image_url,
              s.date_of_birth, s.gender, s.blood_group, s.is_active,
              p.name AS parent_name, p.email AS parent_email, p.contact_number, p.alternative_mobile, p.address
       FROM students s
       JOIN parents p ON s.parent_id = p.id
       WHERE p.email = $1 AND s.is_active = true`,
       [email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get my children error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChildDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    const { id } = req.params;

    // Verify the requesting parent actually owns this child
    const result = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.admission_number, s.roll_number,
              s.grade, s.age, s.profile_image_url, s.date_of_birth, s.gender,
              s.blood_group, s.is_active, s.medical_notes, s.allergies,
              s.emergency_contact_name, s.emergency_contact_phone, s.created_at,
              p.name AS parent_name, p.email AS parent_email, p.contact_number, p.alternative_mobile, p.address,
              c.name AS class_name
       FROM students s
       JOIN parents p ON s.parent_id = p.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = $1 AND p.email = $2`,
      [id, email]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Child not found or access denied' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get child details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
