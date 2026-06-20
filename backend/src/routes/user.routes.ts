import { Router } from 'express';
import { getProfile, updateProfile, getMyChildren, getChildDetails } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Protect all user routes
router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/children', getMyChildren);
router.get('/child/:id', getChildDetails);

export default router;
