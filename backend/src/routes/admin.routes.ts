import { Router } from 'express';
import { getAllStaff, createStaff, updateStaff, deleteStaff, getAllStudents, addFamily, updateStudent, deleteStudent } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

// Protect all admin routes, ensure only admins can access
router.use(authenticate);
router.use(authorize(['super_admin', 'school_admin']));

router.get('/staff', getAllStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

router.get('/students', getAllStudents);
router.post('/add-family', addFamily);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

export default router;
