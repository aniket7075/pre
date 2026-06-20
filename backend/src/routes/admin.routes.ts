import { Router } from 'express';
import { getAllStaff, createStaff, updateStaff, deleteStaff, getAllStudents, addFamily, updateStudent, deleteStudent, uploadImage, getDashboardStats, promoteStudents } from '../controllers/admin.controller';
import multer from 'multer';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

// Protect all admin routes, ensure only admins can access
router.use(authenticate);
router.use(authorize(['super_admin', 'school_admin']));

router.get('/dashboard-stats', getDashboardStats);
router.post('/promote', promoteStudents);

router.get('/staff', getAllStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

router.get('/students', getAllStudents);
router.post('/add-family', addFamily);
router.post('/upload', upload.single('profile_image'), uploadImage);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

export default router;
