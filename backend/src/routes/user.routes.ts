import { Router } from 'express';
import { getProfile } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protect all user routes
router.use(authenticate);

router.get('/me', getProfile);

export default router;
