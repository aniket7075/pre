import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getStudentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { studentId } = req.params;
  try {
    // 1. Attendance Summary
    const attendanceResult = await pool.query(
      `SELECT status, count(*) as count FROM attendance WHERE student_id = $1 GROUP BY status`,
      [studentId]
    );

    // 2. Exam Results
    const examResult = await pool.query(
      `SELECT r.marks_obtained, r.grade, e.name, e.total_marks 
       FROM exam_results r JOIN exams e ON r.exam_id = e.id 
       WHERE r.student_id = $1 ORDER BY e.exam_date DESC LIMIT 5`,
      [studentId]
    );

    // 3. Teacher Notes
    const notesResult = await pool.query(
      `SELECT note_type, content, created_at FROM student_notes WHERE student_id = $1 AND is_visible_to_parent = true ORDER BY created_at DESC LIMIT 5`,
      [studentId]
    );

    res.json({
      attendance: attendanceResult.rows,
      recentExams: examResult.rows,
      notes: notesResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
