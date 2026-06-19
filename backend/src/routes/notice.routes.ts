import { Router } from 'express';
import { createNotice, getNotices } from '../controllers/notice.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Teachers and Admins can create notices
router.post('/', authorize(['super_admin', 'school_admin', 'teacher']), createNotice);

// Anyone authenticated can view notices matching their role
router.get('/', getNotices);

export default router;
