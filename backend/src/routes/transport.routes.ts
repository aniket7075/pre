import { Router } from 'express';
import { getTransportRoutes, getStudentTransport, createTransportRoute, updateTransportRoute, deleteTransportRoute, assignStudentTransport } from '../controllers/transport.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/routes', getTransportRoutes);
router.get('/student/:student_id', getStudentTransport);

router.post('/routes', authorize(['super_admin', 'school_admin']), createTransportRoute);
router.put('/routes/:id', authorize(['super_admin', 'school_admin']), updateTransportRoute);
router.delete('/routes/:id', authorize(['super_admin', 'school_admin']), deleteTransportRoute);
router.post('/assign', authorize(['super_admin', 'school_admin']), assignStudentTransport);

export default router;
