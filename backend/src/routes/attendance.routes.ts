import { Router } from 'express';
import { bulkMarkAttendance, getStudentAttendance, getClassStudents } from '../controllers/attendance.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Teachers and Admins can fetch class students and mark attendance
router.get('/class/:grade', authorize(['super_admin', 'school_admin', 'teacher']), getClassStudents);
router.post('/mark', authorize(['super_admin', 'school_admin', 'teacher']), bulkMarkAttendance);

// Parents, Teachers, Admins can view individual attendance
router.get('/:student_id', authorize(['super_admin', 'school_admin', 'teacher', 'parent']), getStudentAttendance);

export default router;
