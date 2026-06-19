import { Router } from 'express';
import { getAllStaff, createStaff, getAllStudents } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

// Protect all admin routes, ensure only admins can access
router.use(authenticate);
router.use(authorize(['super_admin', 'school_admin']));

router.get('/staff', getAllStaff);
router.post('/staff', createStaff);
router.get('/students', getAllStudents);

export default router;
