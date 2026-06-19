import { Router } from 'express';
import { markAttendance, getStudentAttendance } from '../controllers/attendance.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Teachers and Admins can mark attendance
router.post('/mark', authorize(['super_admin', 'school_admin', 'teacher']), markAttendance);

// Parents, Teachers, Admins can view attendance
router.get('/:student_id', authorize(['super_admin', 'school_admin', 'teacher', 'parent']), getStudentAttendance);

export default router;
