import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';

// ─── Upload Image ────────────────────────────────────────────────────────────
export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
};

// ─── STAFF ───────────────────────────────────────────────────────────────────

export const getAllStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_active, department, designation, phone_number, profile_picture_url
       FROM users 
       WHERE role IN ('teacher', 'non_teaching_staff')
       ORDER BY first_name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, role, department, designation, phoneNumber } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, department, designation, phone_number) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, role, first_name, last_name, department, designation, phone_number`,
      [email, passwordHash, role, firstName, lastName, department || null, designation || null, phoneNumber || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error('Create staff error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, firstName, lastName, role, isActive, department, designation, phoneNumber } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users 
       SET email = $1, first_name = $2, last_name = $3, role = $4, is_active = $5, 
           department = $6, designation = $7, phone_number = $8, updated_at = NOW() 
       WHERE id = $9 AND role IN ('teacher', 'non_teaching_staff')
       RETURNING id, email, first_name, last_name, role, is_active, department, designation, phone_number`,
      [email, firstName, lastName, role, isActive, department || null, designation || null, phoneNumber || null, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error('Update staff error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 AND role IN ('teacher', 'non_teaching_staff') RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }
    res.json({ message: 'Staff deactivated successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, grade } = req.query;

    let query = `
      SELECT 
        s.id, s.first_name, s.last_name, s.admission_number, s.grade,
        s.is_active, s.profile_image_url, s.date_of_birth, s.gender,
        s.blood_group, s.created_at,
        p.name AS parent_name, p.email AS parent_email, 
        p.contact_number, p.alternative_mobile, p.address
      FROM students s
      LEFT JOIN parents p ON s.parent_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (search) {
      query += ` AND (LOWER(s.first_name) LIKE $${idx} OR LOWER(s.last_name) LIKE $${idx} OR LOWER(s.admission_number) LIKE $${idx})`;
      params.push(`%${(search as string).toLowerCase()}%`);
      idx++;
    }
    if (grade) {
      query += ` AND s.grade = $${idx}`;
      params.push(grade);
      idx++;
    }

    query += ' ORDER BY s.first_name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addFamily = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { parentName, contactNumber, alternativeMobile, address, email, password, children } = req.body;

    if (!parentName || !contactNumber || !email || !children || children.length === 0) {
      res.status(400).json({ error: 'Missing required fields: parentName, contactNumber, email, children' });
      return;
    }

    await client.query('BEGIN');

    // Insert into parents table
    const parentResult = await client.query(
      `INSERT INTO parents (name, contact_number, alternative_mobile, address, email) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, contact_number = EXCLUDED.contact_number
       RETURNING id`,
      [parentName, contactNumber, alternativeMobile || null, address || null, email]
    );
    const parentId = parentResult.rows[0].id;

    // Create User login account for parent
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPw = await bcrypt.hash(password || 'Password@123', salt);
      const nameParts = parentName.trim().split(' ');
      await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone_number)
         VALUES ($1, $2, 'parent', $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [email, hashedPw, nameParts[0], nameParts.slice(1).join(' ') || '', contactNumber]
      );
    } catch (e: any) {
      console.warn('Parent user account creation note:', e.message);
    }

    // Insert each child
    const insertedChildren = [];
    for (const child of children) {
      const admissionNum = child.admissionNumber || `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const firstName = child.firstName || (child.name ? child.name.trim().split(' ')[0] : 'Unknown');
      const lastName = child.lastName || (child.name ? child.name.trim().split(' ').slice(1).join(' ') : '');

      const childResult = await client.query(
        `INSERT INTO students (parent_id, first_name, last_name, admission_number, grade, 
          date_of_birth, gender, blood_group, profile_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, first_name, last_name, admission_number`,
        [
          parentId, firstName, lastName, admissionNum, child.grade || null,
          child.dateOfBirth || child.date_of_birth || null,   // nullable – no crash if omitted
          child.gender || 'male',
          child.bloodGroup || null, child.profileImageUrl || null
        ]
      );
      insertedChildren.push(childResult.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      message: 'Family added successfully', 
      parentId,
      children: insertedChildren
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, admissionNumber, grade, isActive, gender, dateOfBirth, bloodGroup } = req.body;
  try {
    const result = await pool.query(
      `UPDATE students 
       SET first_name = $1, last_name = $2, admission_number = $3, grade = $4,
           is_active = $5, gender = COALESCE($6::gender_type, gender),
           date_of_birth = COALESCE($7, date_of_birth),
           blood_group = COALESCE($8::blood_group_type, blood_group),
           updated_at = NOW() 
       WHERE id = $9 RETURNING id, first_name, last_name, admission_number, grade, is_active`,
      [firstName, lastName, admissionNumber, grade, isActive ?? true, gender || null, dateOfBirth || null, bloodGroup || null, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student updated successfully', student: result.rows[0] });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE students SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [studentRes, teacherRes, staffRes, attendanceRes, pendingFeesRes, collectedFeesRes, logsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM students WHERE is_active = true"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND is_active = true"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'non_teaching_staff' AND is_active = true"),
      pool.query("SELECT status, COUNT(*) as count FROM attendance WHERE date = $1 GROUP BY status", [todayStr]),
      pool.query("SELECT COALESCE(SUM(amount_due), 0) as total FROM student_fees WHERE status IN ('pending','overdue','partial')"),
      pool.query("SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments WHERE DATE(payment_date) = $1", [todayStr]),
      pool.query("SELECT action, entity_type as \"entityType\", created_at as \"createdAt\" FROM audit_logs ORDER BY created_at DESC LIMIT 8"),
    ]);

    const totalStudents = parseInt(studentRes.rows[0].count);
    const totalTeachers = parseInt(teacherRes.rows[0].count);
    const totalStaff = parseInt(staffRes.rows[0].count);

    let present = 0;
    let totalAttendance = 0;
    attendanceRes.rows.forEach(row => {
      const cnt = parseInt(row.count);
      totalAttendance += cnt;
      if (['present', 'late'].includes(row.status.toLowerCase())) present += cnt;
    });

    const pendingFees = parseFloat(pendingFeesRes.rows[0].total);
    const todayCollected = parseFloat(collectedFeesRes.rows[0].total);

    res.json({
      totalStudents,
      totalTeachers,
      totalStaff,
      todayAttendance: totalAttendance > 0 ? `${present}/${totalAttendance}` : '0/0',
      attendancePercent: totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0,
      pendingFees,
      todayCollected,
      recentActivities: logsRes.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── PROMOTE STUDENTS ─────────────────────────────────────────────────────────

export const promoteStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fromGrade, toGrade } = req.body;
  if (!fromGrade || !toGrade) {
    res.status(400).json({ error: 'fromGrade and toGrade are required' });
    return;
  }
  try {
    const result = await pool.query(
      `UPDATE students SET grade = $1, updated_at = NOW() WHERE grade = $2 AND is_active = true RETURNING id`,
      [toGrade, fromGrade]
    );
    res.json({ message: `Promoted ${result.rows.length} students from ${fromGrade} to ${toGrade}` });
  } catch (error) {
    console.error('Promote students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
