import { Router } from 'express';
import { getTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry } from '../controllers/timetable.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/:grade', getTimetable);
router.post('/', authorize(['super_admin', 'school_admin', 'teacher']), createTimetableEntry);
router.put('/:id', authorize(['super_admin', 'school_admin', 'teacher']), updateTimetableEntry);
router.delete('/:id', authorize(['super_admin', 'school_admin', 'teacher']), deleteTimetableEntry);

export default router;
