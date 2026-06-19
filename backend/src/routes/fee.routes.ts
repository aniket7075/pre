import { Router } from 'express';
import { getStudentFees, createRazorpayOrder, verifyPayment, assignFee } from '../controllers/fee.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

// Assign fees (Admin/Teacher only)
router.post('/assign', authorize(['super_admin', 'school_admin', 'teacher']), assignFee);

// Get student fees
router.get('/:student_id', getStudentFees);

// Mock payment simulation
router.post('/create-order', authorize(['parent']), createRazorpayOrder);
router.post('/verify-payment', authorize(['parent']), verifyPayment);

export default router;
