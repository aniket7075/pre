import { Router } from 'express';
import { applyLeave, getLeaves, updateLeaveStatus } from '../controllers/leave.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', applyLeave);
router.get('/', getLeaves);
router.put('/:id/status', updateLeaveStatus);

export default router;
