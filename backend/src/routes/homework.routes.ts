import { Router } from 'express';
import { createHomework, getSectionHomework } from '../controllers/homework.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// Teachers and Admins can create homework with files
router.post('/', authorize(['super_admin', 'school_admin', 'teacher']), uploadMiddleware.array('files', 5), createHomework);

// Anyone can view homework for their section
router.get('/:grade', getSectionHomework);

export default router;
