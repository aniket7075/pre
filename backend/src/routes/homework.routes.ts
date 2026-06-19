import { Router } from 'express';
import { createHomework, getSectionHomework } from '../controllers/homework.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Teachers and Admins can create homework
router.post('/', authorize(['super_admin', 'school_admin', 'teacher']), createHomework);

// Anyone can view homework for their section
router.get('/:grade', getSectionHomework);

export default router;
