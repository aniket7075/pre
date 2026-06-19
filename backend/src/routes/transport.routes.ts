import { Router } from 'express';
import { getTransportRoutes, getStudentTransport } from '../controllers/transport.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/routes', getTransportRoutes);
router.get('/student/:student_id', getStudentTransport);

export default router;
