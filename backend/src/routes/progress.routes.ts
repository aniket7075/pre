import { Router } from 'express';
import { getStudentProgress } from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Allow parents, teachers, and admins
router.get('/:studentId', getStudentProgress);

export default router;
