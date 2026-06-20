import { Router } from 'express';
import { createNotice, getNotices, deleteNotice } from '../controllers/notice.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Anyone authenticated can view notices
router.get('/', getNotices);

// Teachers and Admins can create notices
router.post('/', authorize(['super_admin', 'school_admin', 'teacher']), createNotice);

// Only admins can delete notices
router.delete('/:id', authorize(['super_admin', 'school_admin']), deleteNotice);

export default router;
