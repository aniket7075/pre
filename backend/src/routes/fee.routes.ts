import { Router } from 'express';
import { getStudentFees, createRazorpayOrder, verifyPayment } from '../controllers/fee.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/:student_id', getStudentFees);
router.post('/create-order', authorize(['parent']), createRazorpayOrder);
router.post('/verify-payment', authorize(['parent']), verifyPayment);

export default router;
